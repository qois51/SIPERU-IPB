from marshmallow import Schema, fields, validate


class BookingSchema(Schema):
    id = fields.Int(dump_only=True)
    booking_code = fields.Str(dump_only=True)

    # Foreign keys
    room_id = fields.Int(required=True)
    user_id = fields.Int(required=True)

    # Data Peminjam
    nama_peminjam = fields.Str(validate=validate.Length(max=100))
    nim_nip = fields.Str(validate=validate.Length(max=30))
    program_studi = fields.Str(validate=validate.Length(max=100))
    email = fields.Email(validate=validate.Regexp(r'.*@apps\.ipb\.ac\.id$', error='Harap gunakan email @apps.ipb.ac.id'))
    nomor_hp = fields.Str(validate=[validate.Length(min=10, max=20), validate.Regexp(r'^08[0-9]+$', error='Nomor HP harus diawali 08')])

    # Data Kegiatan
    activity_name = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    jenis_kegiatan = fields.Str(validate=validate.Length(max=100))
    organization = fields.Str(load_default='-', validate=validate.Length(max=200))
    participants = fields.Int()
    purpose = fields.Str(load_default='', validate=validate.Length(max=500))
    deskripsi_kegiatan = fields.Str()

    # Schedule
    date = fields.Date(required=True)
    start_time = fields.Str(required=True)
    end_time = fields.Str(required=True)

    # Status & Documents
    status = fields.Str()
    surat_file = fields.Str(allow_none=True)
    document_url = fields.Str(allow_none=True)
    qr_code = fields.Str(dump_only=True)
    notes = fields.Str(allow_none=True)

    # Facilities (list of facility names)
    facilities = fields.List(fields.Str(), load_default=[])

    # Timestamps
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

