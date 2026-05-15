from marshmallow import Schema, fields, validate, EXCLUDE

class LoginSchema(Schema):
    class Meta:
        unknown = EXCLUDE
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    password = fields.String(required=True, validate=validate.Length(min=6))

class RegisterSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    password = fields.String(required=True, validate=validate.Length(min=6))
    role = fields.String(required=True, validate=validate.OneOf(['mahasiswa', 'admin', 'satpam']))
