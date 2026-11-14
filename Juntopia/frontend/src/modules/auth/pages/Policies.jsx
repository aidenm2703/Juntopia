import { useState } from "react";
import { api } from "../../../shared/data/api.js";
import { policyVersion } from "../../../shared/domain/index.js";
import { useAction } from "../../../shared/hooks/useQuery.js";
import { ActionStatus } from "../../../shared/components/Feedback.jsx";
export function PolicyText() {
  return (
    <div className="policy-copy">
      <p className="eyebrow">VERSIÓN {policyVersion} · ENTORNO BETA</p>
      <h2>Un espacio que cuidamos juntos.</h2>
      <h3>Reglas de uso</h3>
      <p>
        Compartí únicamente textos e imágenes propios o con permiso, y enlaces a
        las fuentes oficiales. No publiques material pirateado, datos privados
        de otras personas, amenazas, acoso ni contenido que vulnere sus
        derechos. Los reportes pueden dar lugar a retirar contenido o cancelar
        Parties.
      </p>
      <h3>Qué guardamos</h3>
      <p>
        Supabase gestiona tu correo y contraseña para autenticarte. Juntopia
        guarda tu perfil, avatar, intereses, biblioteca, colecciones, reseñas,
        planes, mensajes y obras que decidas crear. La biblioteca y las
        colecciones son privadas por defecto. La tarjeta de comunidad sólo se
        muestra si la activás o a tus amistades. Las reseñas, las fichas y los
        planes públicos se comparten con miembros registrados.
      </p>
      <h3>Tus controles</h3>
      <p>
        Podés editar tu perfil, ocultar tu tarjeta, gestionar tus colecciones,
        retirar tus reseñas y obras, bloquear personas y reportar contenido
        desde la aplicación. Guardamos la versión y fecha en que aceptás estas
        reglas.
      </p>
      <h3>Servicios externos y versión beta</h3>
      <p>
        Los enlaces externos abren otros servicios, que tienen sus propias
        condiciones. Juntopia no retransmite sus contenidos ni promete
        reproducción sincronizada. Esta versión no incluye cobros ni publicidad.
        Evitá almacenar información sensible durante las pruebas. Los textos y
        los procedimientos de retención, contacto del responsable y eliminación
        de cuenta requieren revisión antes del lanzamiento público.
      </p>
    </div>
  );
}
export function Consent({ done }) {
  const [accepted, setAccepted] = useState(false);
  const action = useAction();
  return (
    <section className="panel consent">
      <PolicyText />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await action.run(() => api.rpc("accept_policy"));
          if (res?.ok) done();
        }}
      >
        <label className="check">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            required
          />
          Leí y acepto las reglas y el aviso de privacidad de esta versión beta.
        </label>
        <button className="primary" disabled={!accepted || action.busy}>
          Aceptar y continuar
        </button>
        <ActionStatus action={action} />
      </form>
    </section>
  );
}
