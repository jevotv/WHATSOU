-- Add city and district columns to orders table
ALTER TABLE orders 
ADD COLUMN city text,
ADD COLUMN district text;
