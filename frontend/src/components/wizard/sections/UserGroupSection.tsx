import React from 'react';
import type { UserGroupConfig } from '../../../types';
import { validateGroupName, validateUUID } from '../../../utils/validators/remoteAccess';

interface UserGroupSectionProps {
  userGroups: UserGroupConfig[];
  addUserGroup: () => void;
  removeUserGroup: (index: number) => void;
  updateUserGroup: (index: number, field: keyof UserGroupConfig, value: string) => void;
}

function getBorderClass(value: string, validate: (v: string) => { isValid: boolean; error?: string }): string {
  if (!value || value.trim() === '') {
    return 'border-dark-border';
  }
  const result = validate(value);
  return result.isValid ? 'border-status-online' : 'border-status-offline';
}

const UserGroupSection: React.FC<UserGroupSectionProps> = ({
  userGroups,
  addUserGroup,
  removeUserGroup,
  updateUserGroup,
}) => {
  return (
    <div className="space-y-4">
      {userGroups.map((group, index) => {
        const nameValidation = validateGroupName(group.name);
        const uuidValidation = validateUUID(group.objId);

        return (
          <div
            key={index}
            className="card-elevated rounded-lg p-4"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent-primary/20 text-accent-primary text-xs font-medium border border-accent-primary/30">
                #{index + 1}
              </span>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeUserGroup(index)}
                  className="text-status-offline hover:text-status-offline/80 text-sm font-medium px-2 py-1 rounded hover:bg-status-offline/10 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-normal text-dark-text mb-1">
                  User Group Name
                </label>
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => updateUserGroup(index, 'name', e.target.value)}
                  placeholder="SAML-Entra-VPN-Users"
                  className={`input-field border-2 ${getBorderClass(group.name, validateGroupName)}`}
                />
                {group.name.trim() !== '' && !nameValidation.isValid && nameValidation.error && (
                  <p className="text-xs text-status-offline mt-1">{nameValidation.error}</p>
                )}
                <p className="text-xs text-dark-muted mt-1.5 leading-relaxed">Name of the user group object on FortiGate. Must match the SAML group mapping.</p>
              </div>

              {/* Azure Group Object ID */}
              <div>
                <label className="block text-sm font-normal text-dark-text mb-1">
                  Azure Group Object ID
                </label>
                <input
                  type="text"
                  value={group.objId}
                  onChange={(e) => updateUserGroup(index, 'objId', e.target.value)}
                  placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                  className={`input-field border-2 ${getBorderClass(group.objId, validateUUID)}`}
                />
                {group.objId.trim() !== '' && !uuidValidation.isValid && uuidValidation.error && (
                  <p className="text-xs text-status-offline mt-1">{uuidValidation.error}</p>
                )}
                <p className="text-xs text-dark-muted mt-1.5 leading-relaxed">UUID from Entra ID. Used to match VPN users to their Azure security group.</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add User Group Button */}
      <button
        type="button"
        onClick={addUserGroup}
        className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
      >
        + Add User Group
      </button>
    </div>
  );
};

export default UserGroupSection;
