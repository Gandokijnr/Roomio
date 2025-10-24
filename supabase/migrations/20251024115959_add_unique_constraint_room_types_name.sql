-- Add unique constraint to room_types name column

ALTER TABLE room_types 
ADD CONSTRAINT room_types_name_unique UNIQUE (name);
