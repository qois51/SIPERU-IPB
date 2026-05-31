import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def send_help_reply_email(to_email: str, name: str, original_message: str, reply_message: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("Warning: SMTP credentials not set. Email not sent.")
        return False
        
    msg = EmailMessage()
    msg['Subject'] = 'Balasan Help Center SIPERU IPB'
    msg['From'] = f"Admin SIPERU <{SMTP_EMAIL}>"
    msg['To'] = to_email
    
    content = f"""Halo {name},

Berikut adalah balasan dari Admin terkait tiket Help Center Anda:

Pesan Anda:
"{original_message}"

Balasan Admin:
"{reply_message}"

Terima kasih,
Tim SIPERU IPB"""
    
    msg.set_content(content)
    
    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
    
    return True

def send_otp_email(to_email: str, otp: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("Warning: SMTP credentials not set. OTP Email not sent.")
        return
        
    msg = EmailMessage()
    msg['Subject'] = 'Kode OTP Lupa Password SIPERU IPB'
    msg['From'] = f"Admin SIPERU <{SMTP_EMAIL}>"
    msg['To'] = to_email
    
    content = f"""Kode OTP Anda adalah: {otp}
    
Masukkan kode ini untuk mereset password Anda.
Kode ini hanya berlaku 5 menit.

Abaikan email ini jika Anda tidak meminta reset password."""

    msg.set_content(content)
    
    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send OTP email: {e}")
        raise Exception("Gagal mengirim email OTP.")
