-- Create optimized view for user management
-- This view pre-joins users with profiles and roles for better performance

DROP VIEW IF EXISTS v_user_management;

CREATE VIEW v_user_management AS
SELECT
    u.id,
    u.email,
    u.username,
    u.status,
    u.email_verified,
    u.last_login_at,
    u.created_at,
    u.updated_at,
    u.provider,

    -- User profile data
    up.name as name ,
    up.is_onboarded,
    up.dob,
    up.english_level,
    up.preferred_accent,
    up.daily_study_goal,

    -- Aggregated roles (comma-separated)
    GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ',') as roles,

    -- Aggregated role IDs for easy filtering
    GROUP_CONCAT(DISTINCT r.id ORDER BY r.id SEPARATOR ',') as role_ids,

    -- User stats (optional - can remove if too heavy)
    us.total_xp,
    us.current_level,
    us.current_streak_days

FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN user_stats us ON u.id = us.user_id

GROUP BY
    u.id, u.email, u.username, u.status, u.email_verified,
    u.last_login_at, u.created_at, u.updated_at, u.provider,
    up.name, up.is_onboarded, up.dob, up.english_level,
    up.preferred_accent, up.daily_study_goal,
    us.total_xp, us.current_level, us.current_streak_days;

-- Create index on view for better query performance
-- Note: MySQL/MariaDB doesn't support indexed views directly,
-- but the underlying table indexes will be used

-- Verify view
SELECT * FROM v_user_management LIMIT 10;
