-- Drop any existing versions of the function
DROP FUNCTION IF EXISTS mark_chore_done(bigint, uuid, uuid, uuid);
DROP FUNCTION IF EXISTS mark_chore_done(uuid, uuid, uuid, uuid);

-- Create the function with the correct parameter types
CREATE OR REPLACE FUNCTION mark_chore_done(
  p_chore_id BIGINT,
  p_household_id UUID,
  p_completed_by UUID,
  p_next_roommate_id UUID
) RETURNS void AS $$
DECLARE
  v_chore_exists BOOLEAN;
  v_chore_name TEXT;
  v_history_id UUID;
BEGIN
  -- Check if the chore exists and get its name
  SELECT EXISTS (
    SELECT 1 FROM chores 
    WHERE id = p_chore_id 
    AND household_id = p_household_id
  ), name INTO v_chore_exists, v_chore_name
  FROM chores 
  WHERE id = p_chore_id;

  IF NOT v_chore_exists THEN
    RAISE EXCEPTION 'Chore with ID % does not exist in household %', p_chore_id, p_household_id;
  END IF;

  -- Log the start of the transaction
  RAISE NOTICE 'Starting transaction for chore "%" (ID: %)', v_chore_name, p_chore_id;

  -- Update the chore
  UPDATE chores
  SET 
    assigned_to = p_next_roommate_id,
    last_completed = timezone('utc'::text, now())
  WHERE id = p_chore_id
    AND household_id = p_household_id;

  -- Log the chore update
  RAISE NOTICE 'Updated chore assignment to roommate %', p_next_roommate_id;

  -- Record the completion in history
  INSERT INTO chore_history (
    household_id,
    chore_id,
    completed_by
  ) VALUES (
    p_household_id,
    p_chore_id,
    p_completed_by
  ) RETURNING id INTO v_history_id;

  -- Log the history insertion
  RAISE NOTICE 'Recorded completion in history with ID %', v_history_id;

  -- Log the completion
  RAISE NOTICE 'Chore "%" (ID: %) marked as done by roommate % and assigned to roommate %',
    v_chore_name, p_chore_id, p_completed_by, p_next_roommate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 