import logging

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, html: str, text: str = ""):
    """
    Demo: logs to console.
    Production: swap body for SendGrid/SES/Mailgun call.
    """
    logger.info("=" * 60)
    logger.info(f"📧 EMAIL | To: {to}")
    logger.info(f"   Subject: {subject}")
    logger.info(f"   Preview: {(text or html)[:160]}…")
    logger.info("=" * 60)


async def send_check_in_email(owner_email: str, owner_name: str, token: str, frontend_url: str):
    link = f"{frontend_url}/api/checkin/{token}"
    await send_email(
        to=owner_email,
        subject="Are you okay? Please confirm you're active.",
        text=f"Hi {owner_name},\n\nPlease confirm you're active: {link}",
        html=(
            f"<p>Hi <strong>{owner_name}</strong>,</p>"
            "<p>We noticed you haven't logged in recently. Please confirm:</p>"
            f'<a href="{link}" style="background:#c4622d;color:white;padding:10px 20px;'
            'text-decoration:none;border-radius:8px;display:inline-block;">I\'m Active</a>'
        ),
    )


async def send_liveness_challenge(owner_email: str, owner_name: str, token: str, frontend_url: str):
    link = f"{frontend_url}/api/checkin/{token}"
    await send_email(
        to=owner_email,
        subject="URGENT: Confirm you are alive — vault action pending",
        text=(
            f"Hi {owner_name},\n\n"
            "A death certificate has been submitted in your name.\n"
            f"If you are alive, confirm immediately: {link}\n\n"
            "You have 15 days. If no response, your vault will be unlocked."
        ),
        html=(
            f"<p>Hi <strong>{owner_name}</strong>,</p>"
            "<p>A death certificate has been submitted in your name. Confirm you are alive:</p>"
            f'<a href="{link}" style="background:#c4622d;color:white;padding:12px 24px;'
            'text-decoration:none;border-radius:8px;display:inline-block;">I Am Alive</a>'
            "<p>You have <strong>15 days</strong> to respond.</p>"
        ),
    )


async def send_suspected_death_notification(beneficiary_email: str, owner_first_name: str):
    await send_email(
        to=beneficiary_email,
        subject="Important notice from Amaanat",
        text=f"We are investigating the wellbeing of {owner_first_name}. We will contact you shortly.",
        html=f"<p>We are investigating the wellbeing of <strong>{owner_first_name}</strong>. We will contact you with updates.</p>",
    )


async def send_execution_package_email(
    beneficiary_email: str, beneficiary_name: str, token: str, frontend_url: str
):
    link = f"{frontend_url}/beneficiary/package/{token}"
    await send_email(
        to=beneficiary_email,
        subject="Your inheritance package is ready",
        text=f"Dear {beneficiary_name},\n\nAccess your inheritance package: {link}\n\nThis link expires in 30 days.",
        html=(
            f"<p>Dear <strong>{beneficiary_name}</strong>,</p>"
            "<p>An inheritance package has been prepared for you:</p>"
            f'<a href="{link}" style="background:#c4622d;color:white;padding:12px 24px;'
            'text-decoration:none;border-radius:8px;display:inline-block;">Access Your Package</a>'
            "<p>This link expires in 30 days.</p>"
        ),
    )
