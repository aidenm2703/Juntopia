import { Component } from "react";
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <section className="panel empty">
        <h1>Algo interrumpió el camino.</h1>
        <p>
          Tus datos guardados siguen en tu cuenta. Recargá para volver a
          intentar.
        </p>
        <button onClick={() => window.location.reload()}>Recargar</button>
      </section>
    ) : (
      this.props.children
    );
  }
}
