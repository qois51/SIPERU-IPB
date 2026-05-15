from marshmallow import Schema, fields, validate

class RoomSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    location = fields.Str(required=True)
    capacity = fields.Int(required=True)
    operational_hours = fields.Str(required=True)
    facilities = fields.Str(required=True)
    pic_name = fields.Str(required=True)
    pic_email = fields.Email(required=True)
    pic_phone = fields.Str(required=True)
    price = fields.Int(required=True)
    image_url = fields.Str(allow_none=True)
    pic_image_url = fields.Str(allow_none=True)
