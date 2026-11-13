import { useCallback } from "react";
import { api } from "../lib/api.js";
import { useQuery } from "../hooks/useQuery.js";
import { Feedback } from "../components/Feedback.jsx";
import { Chat } from "../components/Chat.jsx";
export function Messages({ userId, id }) {
  const query = useQuery(
    useCallback(async () => {
      const [conversations, cards] = await Promise.all([
        api.list("conversations"),
        api.list("member_cards", { order: "display_name" }),
      ]);
      return { conversations, cards };
    }, []),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">UN POCO MÁS CERCA</p>
          <h1>Mensajes</h1>
          <p>Conversaciones privadas entre amistades.</p>
        </div>
        <a href="#/friends">Buscar a mis amigos ↗</a>
      </div>
      <Feedback query={query}>
        {({ conversations, cards }) => (
          <div className="messages-layout">
            <aside className="panel conversation-list">
              {conversations.length ? (
                conversations.map((c) => {
                  const other = c.member_a === userId ? c.member_b : c.member_a;
                  return (
                    <a
                      key={c.id}
                      className={c.id === id ? "active" : ""}
                      href={`#/messages/${c.id}`}
                    >
                      {cards.find((p) => p.id === other)?.display_name ||
                        "Miembro de Juntopia"}{" "}
                      <span>→</span>
                    </a>
                  );
                })
              ) : (
                <p>Empezá una conversación desde la tarjeta de una amistad.</p>
              )}
            </aside>
            {id && conversations.some((c) => c.id === id) ? (
              <Chat
                key={id}
                table="messages"
                parentColumn="conversation_id"
                parentId={id}
                userId={userId}
              />
            ) : (
              <section className="panel empty">
                <h2>Un espacio para conversar.</h2>
                <p>Elegí una conversación o empezá una nueva desde Amigos.</p>
              </section>
            )}
          </div>
        )}
      </Feedback>
    </>
  );
}
