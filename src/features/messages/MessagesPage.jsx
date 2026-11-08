
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageCircleMore,
  Search,
  SquarePen,
  Users,
  Wrench,
  CalendarDays,
  ShoppingCart,
  Send,
  X
} from 'lucide-react';

import { chatApi } from '../../api/index.js';
import './Messages.css';

const filters = [
  'Todos',
  'Vecinos',
  'Servicios',
  'Eventos',
  'Grupos',
  'Ventas'
];

const iconFor = (category) => {
  if (category === 'Servicios') return Wrench;
  if (category === 'Eventos') return CalendarDays;
  if (category === 'Ventas') return ShoppingCart;
  return Users;
};

const formatTime = (value) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPublicationAuthor = (publication) => {
  if (!publication) return null;

  const author =
    publication.author ||
    publication.publisher ||
    publication.user ||
    publication.usuario ||
    publication.creador ||
    {};

  const id =
    publication.authorId ??
    publication.publisherId ??
    publication.userId ??
    publication.usuarioId ??
    publication.createdBy ??
    author.id ??
    null;

  const name =
    publication.authorName ||
    publication.publisherName ||
    publication.userName ||
    publication.nombreUsuario ||
    publication.nombrePublicador ||
    author.name ||
    author.nombre ||
    author.fullName ||
    null;

  return {
    id,
    name,
    publicationId: publication.id ?? null,
    publicationTitle: publication.title || 'Publicación',
    publicationKind: publication.kind || ''
  };
};

const getPublicationCategory = (publication) => {
  const kind = String(publication?.kind || '').toUpperCase();

  if (kind === 'SERVICIO') return 'Servicios';
  if (kind === 'VENTA') return 'Ventas';
  if (kind === 'EVENTO') return 'Eventos';

  return 'Vecinos';
};

const matchesAuthor = (conversation, authorId) => {
  if (authorId == null) return false;

  const candidates = [
    conversation.otherUserId,
    conversation.recipientId,
    conversation.participantId,
    conversation.authorId,
    conversation.publisherId,
    conversation.userId,
    ...(Array.isArray(conversation.participants)
      ? conversation.participants.map(
          (person) =>
            typeof person === 'object'
              ? person.id ?? person.userId
              : person
        )
      : [])
  ];

  return candidates.some(
    (candidate) =>
      candidate != null &&
      String(candidate) === String(authorId)
  );
};

export default function MessagesPage({
  isAuthenticated = false,
  initialConversationId = null,
  initialPublication = null,
  onBack
}) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(
    initialConversationId
  );
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Vecinos');
  const [sending, setSending] = useState(false);
  const [openingPublication, setOpeningPublication] = useState(false);

  const processedPublication = useRef(null);

  const loadConversations = async (category = filter) => {
    try {
      const data = await chatApi.listar(
        category === 'Todos'
          ? {}
          : { categoria: category }
      );

      const list = Array.isArray(data) ? data : [];

      setConversations(list);
      return list;
    } catch (error) {
      setNotice(error.message || 'No se pudieron cargar los chats.');
      return [];
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    loadConversations();
  }, [isAuthenticated, filter]);

  useEffect(() => {
    if (initialConversationId) {
      setFilter('Todos');
      setSearch('');
      setSelectedId(initialConversationId);
    }
  }, [initialConversationId]);

  useEffect(() => {
    if (!isAuthenticated || !initialPublication) return;

    const author = getPublicationAuthor(initialPublication);

    const publicationKey = [
      author?.publicationKind,
      author?.publicationId,
      author?.id
    ].join(':');

    if (processedPublication.current === publicationKey) {
      return;
    }

    processedPublication.current = publicationKey;

    let cancelled = false;

    const openPublicationConversation = async () => {
      setOpeningPublication(true);
      setNotice('');
      setFilter('Todos');
      setSearch('');

      try {
        if (!author?.id) {
          setNotice(
            'Esta publicación no contiene el ID del publicador. ' +
            'Es necesario que el backend incluya ese dato para ' +
            'iniciar una conversación privada.'
          );
          return;
        }

        const data = await chatApi.listar({});
        const list = Array.isArray(data) ? data : [];

        if (cancelled) return;

        setConversations(list);

        const existing = list.find((conversation) =>
          matchesAuthor(conversation, author.id)
        );

        if (existing) {
          setSelectedId(existing.id);
          return;
        }

        // Se conserva el contrato actual de chatApi.crear.
        // El backend debe aceptar recipientId para asociar
        // correctamente el chat con el publicador.
        const created = await chatApi.crear({
          title: author.name || 'Conversación privada',
          subtitle: `Publicación: ${author.publicationTitle}`,
          category: getPublicationCategory(initialPublication),
          recipientId: author.id
        });

        if (cancelled) return;

        if (!created?.id) {
          throw new Error(
            'La API no devolvió el ID de la conversación.'
          );
        }

        setConversations((previous) => {
          const exists = previous.some(
            (conversation) => conversation.id === created.id
          );

          return exists ? previous : [created, ...previous];
        });

        setSelectedId(created.id);

        await loadConversations('Todos');
      } catch (error) {
        if (!cancelled) {
          setNotice(
            error.message ||
            'No fue posible iniciar la conversación.'
          );
        }
      } finally {
        if (!cancelled) setOpeningPublication(false);
      }
    };

    openPublicationConversation();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, initialPublication]);

  useEffect(() => {
    if (!isAuthenticated || !selectedId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        await chatApi.marcarLeido(selectedId);

        const data = await chatApi.mensajes(selectedId);

        if (!cancelled) {
          setMessages(Array.isArray(data) ? data : []);
        }

        await loadConversations('Todos');
      } catch (error) {
        if (!cancelled) {
          setNotice(error.message || 'Error al cargar mensajes.');
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedId, isAuthenticated]);

  const visible = useMemo(
    () =>
      conversations.filter((conversation) =>
        `${conversation.title || ''} ${conversation.subtitle || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [conversations, search]
  );

  const selected = conversations.find(
    (conversation) =>
      String(conversation.id) === String(selectedId)
  );

  const send = async (event) => {
    event.preventDefault();

    const text = draft.trim();

    if (!text || !selectedId || sending) return;

    setSending(true);

    try {
      const newMessage = await chatApi.enviar(selectedId, text);

      setMessages((previous) => [...previous, newMessage]);
      setDraft('');

      await loadConversations('Todos');
    } catch (error) {
      setNotice(error.message || 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const createConversation = async (event) => {
    event.preventDefault();

    if (!newTitle.trim()) return;

    try {
      const created = await chatApi.crear({
        title: newTitle.trim(),
        subtitle: null,
        category: newCategory
      });

      setShowNew(false);
      setNewTitle('');
      setFilter('Todos');
      setSearch('');

      await loadConversations('Todos');

      setSelectedId(created.id);
    } catch (error) {
      setNotice(
        error.message || 'No se pudo crear la conversación.'
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="gf-msg-locked">
        <MessageCircleMore size={40} />
        <h2>Mensajes privados</h2>
        <p>Inicia sesión para acceder a tus conversaciones.</p>

        {onBack && (
          <button onClick={onBack}>Volver al mapa</button>
        )}
      </div>
    );
  }

  return (
    <section className="gf-msg-page">
      <header className="gf-msg-banner">
        <MessageCircleMore size={38} />
        <div>
          <h1>Mensajes</h1>
          <p>
            Comunícate con vecinos, voluntarios y
            organizadores de tu comunidad.
          </p>
        </div>
      </header>

      <div className="gf-msg-shell">
        <aside className="gf-msg-sidebar">
          <div className="gf-msg-searchrow">
            <label className="gf-msg-search">
              <Search size={17} />
              <input
                placeholder="Buscar conversación..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </label>

            <button
              className="gf-msg-new"
              title="Nueva conversación"
              aria-label="Nueva conversación"
              onClick={() => setShowNew(true)}
            >
              <SquarePen size={19} />
            </button>
          </div>

          <div className="gf-msg-filters">
            {filters.map((item) => (
              <button
                key={item}
                className={filter === item ? 'active' : ''}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="gf-msg-conversations">
            {visible.length === 0 ? (
              <p className="gf-msg-empty">
                No tienes conversaciones todavía.
              </p>
            ) : (
              visible.map((conversation) => {
                const Icon = iconFor(conversation.category);

                return (
                  <button
                    key={conversation.id}
                    className={`gf-msg-chatitem ${
                      String(conversation.id) === String(selectedId)
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      setSelectedId(conversation.id)
                    }
                  >
                    <span className="gf-msg-avatar">
                      <Icon size={23} />
                    </span>

                    <span className="gf-msg-chatcopy">
                      <strong>{conversation.title}</strong>
                      <small>{conversation.preview}</small>
                    </span>

                    <span className="gf-msg-chatmeta">
                      <small>
                        {formatTime(conversation.time)}
                      </small>

                      {conversation.unread > 0 && (
                        <b>{conversation.unread}</b>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <div className="gf-msg-main">
          {selected ? (
            <>
              <div className="gf-msg-chathead">
                <span className="gf-msg-avatar">
                  {(() => {
                    const Icon = iconFor(selected.category);
                    return <Icon size={25} />;
                  })()}
                </span>

                <div>
                  <h2>{selected.title}</h2>
                  <p>
                    {selected.subtitle || selected.category}
                  </p>
                </div>
              </div>

              <div className="gf-msg-thread">
                {messages.length === 0 && (
                  <p className="gf-msg-empty">
                    Escribe el primer mensaje de esta conversación.
                  </p>
                )}

                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`gf-msg-bubble ${
                      message.mine ? 'mine' : ''
                    }`}
                  >
                    {!message.mine && (
                      <strong>{message.author}</strong>
                    )}

                    <p>{message.text}</p>

                    <time>
                      {formatTime(message.createdAt)}
                    </time>
                  </article>
                ))}
              </div>

              {notice && (
                <div className="gf-msg-notice">
                  {notice}

                  <button
                    onClick={() => setNotice('')}
                    aria-label="Cerrar aviso"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <form
                className="gf-msg-compose"
                onSubmit={send}
              >
                <input
                  aria-label="Escribe un mensaje"
                  placeholder="Escribe un mensaje..."
                  value={draft}
                  onChange={(event) =>
                    setDraft(event.target.value)
                  }
                  maxLength={2000}
                />

                <button
                  className="gf-msg-send"
                  type="submit"
                  disabled={!draft.trim() || sending}
                  title="Enviar mensaje"
                >
                  <Send size={19} />
                </button>
              </form>
            </>
          ) : (
            <div className="gf-msg-empty">
              {openingPublication
                ? 'Buscando conversación con el publicador...'
                : 'Selecciona una conversación o crea una nueva.'}
            </div>
          )}

          {!selected && notice && (
            <div className="gf-msg-notice">
              {notice}
              <button
                onClick={() => setNotice('')}
                aria-label="Cerrar aviso"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <div
          className="gf-msg-modalshade"
          role="presentation"
          onClick={() => setShowNew(false)}
        >
          <form
            className="gf-msg-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={createConversation}
          >
            <h2>Nueva conversación</h2>

            <label>
              Nombre de la conversación
              <input
                autoFocus
                value={newTitle}
                onChange={(event) =>
                  setNewTitle(event.target.value)
                }
                maxLength={80}
                required
                placeholder="Ej. Vecinos del barrio"
              />
            </label>

            <label>
              Categoría
              <select
                value={newCategory}
                onChange={(event) =>
                  setNewCategory(event.target.value)
                }
              >
                {filters
                  .filter((item) => item !== 'Todos')
                  .map((item) => (
                    <option key={item}>{item}</option>
                  ))}
              </select>
            </label>

            <div>
              <button
                type="button"
                onClick={() => setShowNew(false)}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="gf-msg-primary"
              >
                Crear conversación
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
