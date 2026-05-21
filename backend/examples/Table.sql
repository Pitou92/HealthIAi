CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    age INT,
    sex TEXT,

    height_cm INT,
    weight_kg INT,

    goal TEXT,

    fitness_level TEXT,

    activity_level TEXT,

    diet TEXT,

    equipment JSONB DEFAULT '[]',

    injuries JSONB DEFAULT '[]',

    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    type TEXT NOT NULL, -- workout, nutrition, recovery

    model_name TEXT,
    prompt_version TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recommendation_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,

    version_number INT NOT NULL,

    content JSONB NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(recommendation_id, version_number)
);