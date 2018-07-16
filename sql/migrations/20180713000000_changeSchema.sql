/* Alter transactions table */
DO $$
    BEGIN
        BEGIN
            ALTER TABLE transactions ADD COLUMN payload VARCHAR(50) default NULL;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column payload already exists in transactions, skipping';
        END;
    END;
$$
