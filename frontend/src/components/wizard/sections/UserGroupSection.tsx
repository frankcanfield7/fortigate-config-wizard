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
    return 'border-neutral-600';
  }
  const result = validate(value);
  return result.isValid ? 'border-green-500' : 'border-red-500';
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
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 shadow-sm"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-red-800 text-white text-xs font-bold">
                #{index + 1}
              </span>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeUserGroup(index)}
                  className="text-red-500 hover:text-red-400 text-sm font-medium px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  User Group Name
                </label>
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => updateUserGroup(index, 'name', e.target.value)}
                  placeholder="SAML-Entra-VPN-Users"
                  className={`w-full px-3 py-2.5 bg-neutral-900 border-2 ${getBorderClass(group.name, validateGroupName)} rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 hover:border-neutral-400 hover:bg-neutral-800/80 hover:shadow-[0_0_12px_rgba(120,120,120,0.06)] transition-all duration-200`}
                />
                {group.name.trim() !== '' && !nameValidation.isValid && nameValidation.error && (
                  <p className="text-xs text-red-500 mt-1">{nameValidation.error}</p>
                )}
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">Name of the user group object on FortiGate. Must match the SAML group mapping.</p>
              </div>

              {/* Azure Group Object ID */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Azure Group Object ID
                </label>
                <input
                  type="text"
                  value={group.objId}
                  onChange={(e) => updateUserGroup(index, 'objId', e.target.value)}
                  placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                  className={`w-full px-3 py-2.5 bg-neutral-900 border-2 ${getBorderClass(group.objId, validateUUID)} rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 hover:border-neutral-400 hover:bg-neutral-800/80 hover:shadow-[0_0_12px_rgba(120,120,120,0.06)] transition-all duration-200`}
                />
                {group.objId.trim() !== '' && !uuidValidation.isValid && uuidValidation.error && (
                  <p className="text-xs text-red-500 mt-1">{uuidValidation.error}</p>
                )}
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">UUID from Entra ID. Used to match VPN users to their Azure security group.</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add User Group Button */}
      <button
        type="button"
        onClick={addUserGroup}
        className="bg-red-800 hover:bg-red-900 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
      >
        + Add User Group
      </button>
    </div>
  );
};

export default UserGroupSection;
