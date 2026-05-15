from marshmallow import Schema, fields, validate, EXCLUDE

class UserSchema(Schema):
    class Meta:
        unknown = EXCLUDE
        
    id = fields.Integer(dump_only=True)
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    password = fields.String(load_only=True, validate=validate.Length(min=6))
    role = fields.String(required=True, validate=validate.OneOf(['mahasiswa', 'admin', 'satpam', 'karyawan']))
    full_name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    nim_nip = fields.String(required=True, validate=validate.Length(min=1, max=20))
    email = fields.Email(required=True)
    profile_image = fields.String(allow_none=True)

user_schema = UserSchema()
users_schema = UserSchema(many=True)
