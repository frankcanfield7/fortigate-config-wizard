-- FortiGate Spartan Wizard - Supabase Database Setup
-- Run this entire script in the Supabase SQL Editor (Database > SQL Editor)
-- ============================================================================

-- PART 1: SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurations table
CREATE TABLE configurations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  config_type TEXT NOT NULL DEFAULT 'ipsec',
  data_json JSONB NOT NULL DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration versions table
CREATE TABLE configuration_versions (
  id BIGSERIAL PRIMARY KEY,
  configuration_id BIGINT NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data_json JSONB NOT NULL,
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(configuration_id, version_number)
);

-- Audit log table
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_configurations_user_id ON configurations(user_id);
CREATE INDEX idx_configurations_is_template ON configurations(is_template);
CREATE INDEX idx_configuration_versions_config_id ON configuration_versions(configuration_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- PART 2: TRIGGERS
-- ============================================================================

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configurations_updated_at
  BEFORE UPDATE ON configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- PART 3: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Configurations policies
CREATE POLICY "Users can view own configs"
  ON configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view templates"
  ON configurations FOR SELECT
  USING (is_template = TRUE);

CREATE POLICY "Users can insert own configs"
  ON configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configs"
  ON configurations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own configs"
  ON configurations FOR DELETE
  USING (auth.uid() = user_id);

-- Configuration versions policies
CREATE POLICY "Users can view versions of own configs"
  ON configuration_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM configurations
      WHERE configurations.id = configuration_versions.configuration_id
      AND configurations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert versions for own configs"
  ON configuration_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM configurations
      WHERE configurations.id = configuration_versions.configuration_id
      AND configurations.user_id = auth.uid()
    )
  );

-- Audit log policies
CREATE POLICY "Admins can view all audit logs"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (TRUE);

-- PART 4: DATABASE FUNCTIONS (Business Logic)
-- ============================================================================

-- Get next version number for a configuration
CREATE OR REPLACE FUNCTION get_next_version_number(config_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_num
  FROM configuration_versions
  WHERE configuration_id = config_id;
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Create configuration with initial version
CREATE OR REPLACE FUNCTION create_configuration_with_version(
  p_name TEXT,
  p_description TEXT,
  p_config_type TEXT,
  p_data_json JSONB
)
RETURNS SETOF configurations AS $$
DECLARE
  new_config configurations;
BEGIN
  INSERT INTO configurations (user_id, name, description, config_type, data_json)
  VALUES (auth.uid(), p_name, p_description, p_config_type, p_data_json)
  RETURNING * INTO new_config;

  INSERT INTO configuration_versions (configuration_id, version_number, data_json, change_description)
  VALUES (new_config.id, 1, p_data_json, 'Initial version');

  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), 'create_configuration', 'configuration', new_config.id::TEXT,
    jsonb_build_object('name', p_name, 'config_type', p_config_type));

  RETURN NEXT new_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update configuration with version tracking
CREATE OR REPLACE FUNCTION update_configuration_with_version(
  p_id BIGINT,
  p_name TEXT,
  p_description TEXT,
  p_data_json JSONB,
  p_change_description TEXT DEFAULT 'Updated'
)
RETURNS SETOF configurations AS $$
DECLARE
  updated_config configurations;
  next_version INTEGER;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM configurations WHERE id = p_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update config
  UPDATE configurations
  SET name = p_name, description = p_description, data_json = p_data_json
  WHERE id = p_id
  RETURNING * INTO updated_config;

  -- Create new version
  next_version := get_next_version_number(p_id);
  INSERT INTO configuration_versions (configuration_id, version_number, data_json, change_description)
  VALUES (p_id, next_version, p_data_json, p_change_description);

  -- Log audit
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), 'update_configuration', 'configuration', p_id::TEXT,
    jsonb_build_object('name', p_name, 'version', next_version));

  RETURN NEXT updated_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Duplicate configuration
CREATE OR REPLACE FUNCTION duplicate_configuration(p_id BIGINT)
RETURNS SETOF configurations AS $$
DECLARE
  source_config configurations;
  new_config configurations;
BEGIN
  -- Get source config (must be owned by user or be a template)
  SELECT * INTO source_config
  FROM configurations
  WHERE id = p_id AND (user_id = auth.uid() OR is_template = TRUE);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Configuration not found or not accessible';
  END IF;

  -- Create duplicate
  INSERT INTO configurations (user_id, name, description, config_type, data_json)
  VALUES (
    auth.uid(),
    source_config.name || ' (Copy)',
    source_config.description,
    source_config.config_type,
    source_config.data_json
  )
  RETURNING * INTO new_config;

  -- Create initial version
  INSERT INTO configuration_versions (configuration_id, version_number, data_json, change_description)
  VALUES (new_config.id, 1, source_config.data_json, 'Duplicated from ' || source_config.name);

  -- Log audit
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), 'duplicate_configuration', 'configuration', new_config.id::TEXT,
    jsonb_build_object('source_id', p_id, 'name', new_config.name));

  RETURN NEXT new_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore configuration version
CREATE OR REPLACE FUNCTION restore_configuration_version(
  p_config_id BIGINT,
  p_version_id BIGINT
)
RETURNS SETOF configurations AS $$
DECLARE
  version_data configuration_versions;
  updated_config configurations;
  next_version INTEGER;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM configurations WHERE id = p_config_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Get version data
  SELECT * INTO version_data
  FROM configuration_versions
  WHERE id = p_version_id AND configuration_id = p_config_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version not found';
  END IF;

  -- Update config with version data
  UPDATE configurations
  SET data_json = version_data.data_json
  WHERE id = p_config_id
  RETURNING * INTO updated_config;

  -- Create new version recording the restore
  next_version := get_next_version_number(p_config_id);
  INSERT INTO configuration_versions (configuration_id, version_number, data_json, change_description)
  VALUES (p_config_id, next_version, version_data.data_json,
    'Restored from version ' || version_data.version_number);

  -- Log audit
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), 'restore_version', 'configuration', p_config_id::TEXT,
    jsonb_build_object('restored_version', version_data.version_number, 'new_version', next_version));

  RETURN NEXT updated_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create from template
CREATE OR REPLACE FUNCTION create_from_template(
  p_template_id BIGINT,
  p_name TEXT
)
RETURNS SETOF configurations AS $$
DECLARE
  template_config configurations;
  new_config configurations;
BEGIN
  -- Get template
  SELECT * INTO template_config
  FROM configurations
  WHERE id = p_template_id AND is_template = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  -- Create new config from template
  INSERT INTO configurations (user_id, name, description, config_type, data_json)
  VALUES (
    auth.uid(),
    p_name,
    template_config.description,
    template_config.config_type,
    template_config.data_json
  )
  RETURNING * INTO new_config;

  -- Create initial version
  INSERT INTO configuration_versions (configuration_id, version_number, data_json, change_description)
  VALUES (new_config.id, 1, template_config.data_json, 'Created from template: ' || template_config.name);

  -- Log audit
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), 'create_from_template', 'configuration', new_config.id::TEXT,
    jsonb_build_object('template_id', p_template_id, 'name', p_name));

  RETURN NEXT new_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Get audit logs with pagination
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_action TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  user_id UUID,
  username TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Verify admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    p.username,
    al.action,
    al.resource_type,
    al.resource_id,
    al.details,
    al.created_at
  FROM audit_log al
  LEFT JOIN profiles p ON al.user_id = p.id
  WHERE (p_action IS NULL OR al.action = p_action)
    AND (p_user_id IS NULL OR al.user_id = p_user_id)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SETUP COMPLETE!
-- Next: Go to Authentication > Providers and ensure Email auth is enabled
-- ============================================================================
