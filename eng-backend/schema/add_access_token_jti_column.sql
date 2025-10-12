-- Add access_token_jti column to refresh_tokens table
-- This links a refresh token to its corresponding access token's JTI
ALTER TABLE refresh_tokens
ADD COLUMN access_token_jti VARCHAR(36) AFTER token_hash,
ADD INDEX idx_access_token_jti (access_token_jti);

-- Update comment for the column
ALTER TABLE refresh_tokens
MODIFY COLUMN access_token_jti VARCHAR(36)
COMMENT 'JTI of the access token associated with this refresh token';
