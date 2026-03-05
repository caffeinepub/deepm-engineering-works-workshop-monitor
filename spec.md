# Deepam Engineering Works - Workshop Monitor

## Current State
The app has 6 workshop sections: Container, Cabin, Painting, Parking, Underparts, Delivery.
- Container: has `team_leader` (dropdown), `customer_name`
- Cabin: has `team_no` (dropdown 1–5), `customer_name`
- Painting: has `team_no` (dropdown 1–2), `customer_name`
- Parking: has `customer_name` only (no team)
- Underparts: has `team_name` (dropdown Mani/Thangavel), `customer_name`
- Delivery: has `vehicle_no`, `customer_name`, `driver_name` — NO team field

None of the sections have a `custom_name` free-text field.

## Requested Changes (Diff)

### Add
- `team_name` field to Delivery section (dropdown with delivery team names)
- `custom_name` free-text field to ALL 6 sections (Container, Cabin, Painting, Parking, Underparts, Delivery)

### Modify
- Backend Motoko types and inputs: add `teamName` to Delivery, add `customName` to all 6 section types + inputs + CRUD handlers
- Frontend `types.ts`: add `team_name` to Delivery, add `custom_name` to all 6 types
- All 6 forms: add the new fields in the UI
- `RecordCard.tsx`: display `custom_name` and `team_name` (Delivery) in the card body

### Remove
- Nothing removed

## Implementation Plan
1. Update `src/backend/main.mo`: add `teamName: Text` to Delivery type + input, add `customName: Text` to all 6 section types + inputs, update all CRUD handlers to pass through new fields
2. Update `src/frontend/src/lib/types.ts`: mirror the new fields
3. Update all 6 form components to include new input fields with proper labels
4. Update `RecordCard.tsx` to display `custom_name` and delivery `team_name`
5. Update any hooks that map backend data to frontend types
