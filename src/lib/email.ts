import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = new Resend(resendApiKey);

const EMAIL_FROM = process.env.EMAIL_FROM || "Sinoma Warehouse ERP <onboarding@resend.dev>";

/**
 * Sends a password reset verification email via Resend
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
            .content { padding: 32px 24px; line-height: 1.6; }
            .btn { display: inline-block; background: #0284c7; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin: 24px 0; }
            .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .token-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 16px; direction: ltr; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>شركة سينوما للمقاولات العامة</h1>
              <p>نظام إدارة المستودعات والعمليات اللوجستية (ERP)</p>
            </div>
            <div class="content" style="text-align: right;">
              <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">طلب إعادة تعيين كلمة المرور</h2>
              <p>مرحباً <strong>${name}</strong>،</p>
              <p>تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في نظام مستودعات سينوما. اضغط على الزر التالي لتعيين كلمة مرور جديدة:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="btn">إعادة تعيين كلمة المرور (Reset Password)</a>
              </div>

              <p style="font-size: 12px; color: #64748b;">
                هذا الرابط صالح للاستخدام لمدة <strong>60 دقيقة فقط</strong> لمرة واحدة. إذا لم تكن قد طلبت إعادة التعيين، يُرجى تجاهل هذه الرسالة، وسيبقى حسابك آمناً.
              </p>

              <p style="font-size: 11px; color: #94a3b8; margin-top: 24px;">إذا لم يعمل الزر أعلاه، يمكنك نسخ الرابط التالي ولصقه في متصفحك:</p>
              <div class="token-box">${resetUrl}</div>
            </div>
            <div class="footer">
              Sinoma CDI Contracting • Warehouse & Logistics ERP<br>
              هذه رسالة آلية تم إنشاؤها عبر منصة Resend - يرجى عدم الرد المباشر عليها.
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "إعادة تعيين كلمة المرور | Sinoma Warehouse ERP",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error sending reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("Email dispatch exception:", err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}

/**
 * Sends a staff invitation & account activation email to a newly created Storekeeper / Engineer
 */
export async function sendStaffActivationEmail({
  to,
  name,
  role,
  activationUrl,
  invitedByName = "إدارة النظام",
}: {
  to: string;
  name: string;
  role: string;
  activationUrl: string;
  invitedByName?: string;
}) {
  try {
    const roleTitles: Record<string, string> = {
      ADMIN: "مدير النظام (Administrator)",
      STOREKEEPER: "أمين المستودع (Warehouse Storekeeper)",
      SITE_ENGINEER: "مهندس الموقع (Site Engineer)",
      VIEWER: "مراقب / تدقيق (Auditor & Viewer)",
    };

    const roleName = roleTitles[role] || role;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
            .content { padding: 32px 24px; line-height: 1.6; }
            .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 12px; }
            .btn { display: inline-block; background: #059669; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin: 24px 0; }
            .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>شركة سينوما للمقاولات العامة</h1>
              <p>نظام إدارة المستودعات والعمليات اللوجستية (ERP)</p>
            </div>
            <div class="content" style="text-align: right;">
              <span class="badge">دعوة انضمام لطاقم العمل</span>
              <h2 style="font-size: 18px; margin-top: 4px; color: #0f172a;">مرحباً بك في طاقم مستودع سينوما</h2>
              <p>عزيزي <strong>${name}</strong>،</p>
              <p>قام <strong>${invitedByName}</strong> بإنشاء حساب تشغيلي لك على نظام المستودعات بصلاحية:</p>
              
              <div class="box">
                <div style="font-size: 13px; color: #64748b;">الدور الوظيفي المعتمد:</div>
                <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${roleName}</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 8px;">البريد الإلكتروني المعتمد:</div>
                <div style="font-size: 14px; font-family: monospace; color: #0284c7; direction: ltr; text-align: right;">${to}</div>
              </div>

              <p>يرجى النقر على الرابط التالي لتفعيل حسابك وتعيين كلمة المرور الخاصة بك للبدء في استخدام النظام:</p>

              <div style="text-align: center;">
                <a href="${activationUrl}" class="btn">تفعيل الحساب وتعيين كلمة المرور</a>
              </div>

              <p style="font-size: 12px; color: #64748b;">
                يرجى إكمال تفعيل الحساب خلال 48 ساعة من استلام هذه الدعوة.
              </p>
            </div>
            <div class="footer">
              Sinoma CDI Contracting • Warehouse & Logistics ERP<br>
              تم إرسال هذا الإشعار تلقائياً عبر Resend لموظفي شركة سينوما فقط.
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `دعوة تفعيل حساب جديد في مستودع سينوما (${roleName})`,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error sending activation email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("Activation email exception:", err);
    return { success: false, error: err.message || "Failed to send invitation email" };
  }
}

