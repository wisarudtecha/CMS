import { Trans } from "@lingui/react/macro";

export default function Lingui() {
  const messages = [{}, {}];
  const messagesCount = messages.length;
  const lastLogin = new Date();
  const markAsRead = () => {
    alert("Marked as read.");
  };

  return (
    <div>
      <h1>Message Inbox</h1>

      <h2>
        <Trans>time.just_now</Trans>
      </h2>

      <p>
        See all <a href="/unread">unread messages</a>
        {" or "}
        <a onClick={markAsRead}>mark them</a> as read.
      </p>

      <p>
        {messagesCount === 1
          ? `There's ${messagesCount} message in your inbox.`
          : `There are ${messagesCount} messages in your inbox.`}
      </p>

      <footer>Last login on {lastLogin.toLocaleDateString()}.</footer>
    </div>
  );
}
