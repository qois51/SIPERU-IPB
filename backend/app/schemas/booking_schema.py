from marshmallow import Schema, fields, validate

class BookingSchema(Schema):
    id = fields.Int(dump_only=True)
    room_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    date = fields.Date(required=True)
    start_time = fields.Str(required=True)
    end_time = fields.Str(required=True)
    status = fields.Str(dump_only=True)
    activity_name = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    organization = fields.Str(required=True, validate=validate.Length(min=2, max=200))
    participants = fields.Int()
    purpose = fields.Str(required=True, validate=validate.Length(min=5, max=500))
    document_url = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
