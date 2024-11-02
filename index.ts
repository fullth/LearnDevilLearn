import axios from 'axios';
import nodemailer from 'nodemailer';

const openAiApiKey = process.env.OPENAI_API_KEY || '';
const emailUser = process.env.EMAIL_USER || '';
const emailPass = process.env.EMAIL_PASS || '';
const recipientEmail = process.env.RECIPIENT_EMAIL || '';
const prompt = process.env.PROMPT || '';

async function getGPTResponse(question: string): Promise<string> {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: question,
                }],
                max_tokens: 150,
            },
            {
                headers: {
                    Authorization: `Bearer ${openAiApiKey}`,
                },
            }
        );
        console.log('GPT Response:', JSON.stringify(response.data, null, 2));

        const content = response.data?.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('GPT API 응답 확인필요');
        }

        return content.trim();
    } catch (error) {
        console.error('GPT API Error:', error);
        return 'GPT API 에러 발생';
    }
}

async function sendEmail(subject: string, text: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    await transporter.sendMail({
        from: emailUser,
        to: recipientEmail,
        subject,
        text,
    });
}

(async () => {
    const question = prompt;
    const gptResponse = await getGPTResponse(question);

    if (gptResponse) {
        await sendEmail('[LDL] 오늘의 개념', gptResponse);
        console.log('이메일 발송 완료');
    } else {
        console.log('GPT 응답 실패');
    }
})();