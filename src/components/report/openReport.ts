let jasperWin: Window | null = null;

export function openJasperReport(url: string) {
    // มี window อยู่แล้ว? → ข้าม auth
    if (jasperWin && !jasperWin.closed) {
        jasperWin.location.href = url;
        jasperWin.focus();
        return;
    }

    // ไม่มี window → สร้างใหม่และทำ login
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://jasper-stg.metthier.ai/jasperserver/j_spring_security_check";
    form.target = "jasperWin";

    // เปิดหน้าต่างใหม่ + เก็บ reference
    jasperWin = window.open("", "jasperWin");

    const params: Record<string, string> = {
        j_username: import.meta.env.VITE_JASPER_USERNAME || "" ,
        j_password_pseudo: import.meta.env.VITE_JASPER_PASSWORD || "",
        j_password: import.meta.env.VITE_JASPER_PASSWORD || "",
        userLocale: "en_US",
        userTimezone: "Asia/Bangkok",
        OWASP_CSRFTOKEN: "8L44-SFA9-FQVL-0HIB-0P9N-X5NY-GDVJ-48AS"
    };

    for (const key in params) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
    }

    document.body.appendChild(form);

    // Login ด้วย POST
    form.submit();

    // หลัง login แล้ว redirect → เปิด report
    setTimeout(() => {
        jasperWin?.location.assign(url);
    }, 1500);
}
