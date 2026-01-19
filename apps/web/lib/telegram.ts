export async function sendNewUserAlert(phone: string, createdAt: string) {
    const TELEGRAM_TOKEN = '8289064862:AAGtVYRSK5Osuv3oIldMYkD0gAZxk5RyVDI';
    const CHAT_ID = '1177042323';

    const message = `
🔔 *New User Registered*

👤 Name: N/A
📱 Phone: ${phone}
📅 Date: ${new Date(createdAt).toLocaleString('en-US')}
    `.trim();

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            }
        );

        if (!response.ok) {
            console.error('Failed to send Telegram notification:', await response.text());
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
}
