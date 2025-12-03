# utils.py
import smtplib
from email.mime.text import MIMEText

def soil_type_to_num(soil_type):
    mapping = {
        "Black": 0,
        "Red": 1,
        "Sandy": 2
    }
    return mapping.get(soil_type, -1)

# You can keep season_to_num for future, but not use it now

def prepare_features(data):
    soil = soil_type_to_num(data["soil_type"])
    temp = data["weather"]["temp"]
    humidity = data["weather"]["humidity"]
    
    return [soil, temp, humidity]  # ✅ Only 3 features now

def send_email_notification(to_email, subject, message):
    print("send_email_notification called")
    # Gmail SMTP settings
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = "omeshshewale965@gmail.com"
    sender_password = "ubzr qbob lrbf ftmi"  # Use App Password, not your main password

    msg = MIMEText(message)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, [to_email], msg.as_string())
        server.quit()
        print("Email sent!")
    except Exception as e:
        print("Failed to send email:", e)