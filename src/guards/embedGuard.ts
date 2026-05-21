// /src/guards/embedGuard.ts
import {
  isEmbedded,
  isEmbedAllowedByEnv,
  isAllowedReferrer,
} from "@/utils/embed";

export const enforceEmbedPolicy = (): void => {
  if (!isEmbedded()) return;

  if (!isEmbedAllowedByEnv()) {
    hardBlock("Embedding disabled in this environment");
  }

  if (!isAllowedReferrer()) {
    hardBlock("Embedding from this domain is not allowed");
  }
};

const hardBlock = (reason: string) => {
  console.error("[EMBED BLOCKED]", reason);

  document.documentElement.innerHTML = "";
  document.body.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      height:100vh;
      font-family:sans-serif;
      background:#fff;
      color:#333;
    ">
      <div>
        <h2>Access denied</h2>
        <p>${reason}</p>
      </div>
    </div>
  `;

  throw new Error(reason);
};
