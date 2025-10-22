{
"SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default\nFROM information_schema.columns\nWHERE table_schema NOT IN ('pg_catalog', 'information_schema')\nORDER BY table_schema, table_name, ordinal_position\n": [
	{
		"table_schema" : "public",
		"table_name" : "analytics",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "analytics",
		"column_name" : "userId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "analytics",
		"column_name" : "activityLog",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : "'[]'::jsonb"
	},
	{
		"table_schema" : "public",
		"table_name" : "analytics",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "analytics",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "cvId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "userId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "jobDescription",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "content",
		"data_type" : "text",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "personalizedContent",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "tone",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : "'professional'::character varying"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "format",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : "'standard'::character varying"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "wordCount",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : "0"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "isCustomized",
		"data_type" : "boolean",
		"is_nullable" : "NO",
		"column_default" : "false"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "notes",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_cover_letters",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "cvId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "userId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "jobDescription",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "score",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "matchedSkills",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "missingSkills",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "suggestions",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "strengths",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "notes",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cv_matching_analyses",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "userId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "originalFileName",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "fileUrl",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "parsedData",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "version",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : "1"
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "isTailored",
		"data_type" : "boolean",
		"is_nullable" : "NO",
		"column_default" : "false"
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "tailoredForJob",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "improvementNotes",
		"data_type" : "jsonb",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "originalCvId",
		"data_type" : "uuid",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "jobDescriptionId",
		"data_type" : "uuid",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "versionHistory",
		"data_type" : "jsonb",
		"is_nullable" : "YES",
		"column_default" : "'[]'::jsonb"
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "jobDescriptionData",
		"data_type" : "jsonb",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "matchingAnalysis",
		"data_type" : "jsonb",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "cvs",
		"column_name" : "coverLetter",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "userId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "title",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "description",
		"data_type" : "text",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "company",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "location",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "salary",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "experience",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "requirements",
		"data_type" : "jsonb",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "keywords",
		"data_type" : "jsonb",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "job_descriptions",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "migrations",
		"column_name" : "id",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : "nextval('migrations_id_seq'::regclass)"
	},
	{
		"table_schema" : "public",
		"table_name" : "migrations",
		"column_name" : "timestamp",
		"data_type" : "bigint",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "migrations",
		"column_name" : "name",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "name",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "displayName",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "description",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "fileName",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "metadata",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "isActive",
		"data_type" : "boolean",
		"is_nullable" : "NO",
		"column_default" : "true"
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "isPremium",
		"data_type" : "boolean",
		"is_nullable" : "NO",
		"column_default" : "false"
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "usageCount",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : "0"
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolio_templates",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "username",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "uuid",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "template",
		"data_type" : "USER-DEFINED",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "customDomain",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "bio",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "avatar",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "linkedinUrl",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "githubUrl",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "websiteUrl",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "generatedHtml",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "generatedUrl",
		"data_type" : "text",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "isActive",
		"data_type" : "boolean",
		"is_nullable" : "NO",
		"column_default" : "true"
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "userId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "portfolios",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "userId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "name",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "role",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "techStack",
		"data_type" : "ARRAY",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "description",
		"data_type" : "text",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "results",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "cvBullets",
		"data_type" : "ARRAY",
		"is_nullable" : "NO",
		"column_default" : "'{}'::text[]"
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "demoLink",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "githubLink",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "imageUrl",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "projects",
		"column_name" : "cvIds",
		"data_type" : "ARRAY",
		"is_nullable" : "NO",
		"column_default" : "'{}'::text[]"
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "name",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "displayName",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "description",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "metadata",
		"data_type" : "jsonb",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "isActive",
		"data_type" : "boolean",
		"is_nullable" : "NO",
		"column_default" : "true"
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "isPremium",
		"data_type" : "boolean",
		"is_nullable" : "NO",
		"column_default" : "false"
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "usageCount",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : "0"
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "templates",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "user_usage",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "user_usage",
		"column_name" : "userId",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "user_usage",
		"column_name" : "cvUploads",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : "0"
	},
	{
		"table_schema" : "public",
		"table_name" : "user_usage",
		"column_name" : "projects",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : "0"
	},
	{
		"table_schema" : "public",
		"table_name" : "user_usage",
		"column_name" : "jobTailors",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : "0"
	},
	{
		"table_schema" : "public",
		"table_name" : "user_usage",
		"column_name" : "exports",
		"data_type" : "integer",
		"is_nullable" : "NO",
		"column_default" : "0"
	},
	{
		"table_schema" : "public",
		"table_name" : "user_usage",
		"column_name" : "resetDate",
		"data_type" : "date",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "users",
		"column_name" : "id",
		"data_type" : "uuid",
		"is_nullable" : "NO",
		"column_default" : "uuid_generate_v4()"
	},
	{
		"table_schema" : "public",
		"table_name" : "users",
		"column_name" : "email",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "users",
		"column_name" : "name",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "users",
		"column_name" : "avatar",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "users",
		"column_name" : "plan",
		"data_type" : "character varying",
		"is_nullable" : "NO",
		"column_default" : "'free'::character varying"
	},
	{
		"table_schema" : "public",
		"table_name" : "users",
		"column_name" : "googleId",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "users",
		"column_name" : "password",
		"data_type" : "character varying",
		"is_nullable" : "YES",
		"column_default" : null
	},
	{
		"table_schema" : "public",
		"table_name" : "users",
		"column_name" : "createdAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	},
	{
		"table_schema" : "public",
		"table_name" : "users",
		"column_name" : "updatedAt",
		"data_type" : "timestamp without time zone",
		"is_nullable" : "NO",
		"column_default" : "now()"
	}
]}
