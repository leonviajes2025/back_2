import apiDocs from "@/data/api-docs.json";

type Endpoint = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  operation: string;
  request: string;
  responses: string[];
  routeParams?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  bodyFields?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  exampleBody?: string;
  notes?: string;
};

type EndpointGroup = {
  name: string;
  route: string;
  summary: string;
  endpoints: Endpoint[];
};

type ApiDocsData = {
  basePath: string;
  methodLegend: Endpoint["method"][];
  groups: EndpointGroup[];
};

const docs = apiDocs as ApiDocsData;
const endpointGroups = docs.groups;
const methodLegend = docs.methodLegend;
const totalEndpoints = endpointGroups.reduce((count, group) => count + group.endpoints.length, 0);

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Mapa de endpoints</p>
          <h1>Documentación visual de la API</h1>
          <p className="lead">
            Todos los endpoints del proyecto agrupados por recurso, con método HTTP,
            ruta exacta y una descripción corta de su función.
          </p>
        </div>

        <div className="hero-stats" aria-label="Resumen de la API">
          <div className="stat-card">
            <span className="stat-value">{endpointGroups.length}</span>
            <span className="stat-label">grupos de rutas</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalEndpoints}</span>
            <span className="stat-label">endpoints documentados</span>
          </div>
          <div className="stat-card stat-card-base">
            <span className="stat-label">base path</span>
            <span className="stat-base">{docs.basePath}</span>
          </div>
        </div>
      </section>

      <section className="docs-shell" aria-label="Documentación técnica de la API">
        <aside className="docs-sidebar">
          <div className="sidebar-card">
            <p className="sidebar-title">Recursos</p>
            <ul className="sidebar-list">
              {endpointGroups.map((group) => (
                <li key={group.route}>
                  <a href={`#${group.name}`}>{group.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-card">
            <p className="sidebar-title">Métodos</p>
            <div className="legend-list">
              {methodLegend.map((method) => (
                <span key={method} className={`method-badge method-${method.toLowerCase()}`}>
                  {method}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <div className="docs-content">
          {endpointGroups.map((group) => (
            <section key={group.route} id={group.name} className="group-card">
              <div className="group-header">
                <div>
                  <p className="group-kicker">tag: {group.name}</p>
                  <h2>{group.route}</h2>
                </div>
                <span className="group-count">{group.endpoints.length} operations</span>
              </div>

              <p className="group-summary">{group.summary}</p>

              <ul className="endpoint-list">
                {group.endpoints.map((endpoint) => (
                  <li key={`${endpoint.method}-${endpoint.path}`} className="endpoint-item">
                    <div className="endpoint-topline">
                      <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
                        {endpoint.method}
                      </span>
                      <code>{endpoint.path}</code>
                    </div>

                    <div className="endpoint-meta">
                      <span className="meta-chip">{endpoint.operation}</span>
                      <span className="meta-chip">runtime nodejs</span>
                    </div>

                    <p>{endpoint.description}</p>

                    <details className="endpoint-details">
                      <summary className="endpoint-summary">Ver detalle técnico</summary>

                      <div className="endpoint-details-content">
                        <div className="endpoint-block">
                          <span className="block-label">Request</span>
                          <p>{endpoint.request}</p>
                        </div>

                        <div className="endpoint-block">
                          <span className="block-label">Route params</span>
                          {endpoint.routeParams && endpoint.routeParams.length > 0 ? (
                            <ul className="field-list">
                              {endpoint.routeParams.map((param) => (
                                <li key={param.name} className="field-item">
                                  <div className="field-topline">
                                    <code>{param.name}</code>
                                    <span className="field-type">{param.type}</span>
                                    <span className={`required-chip ${param.required ? "required-yes" : "required-no"}`}>
                                      {param.required ? "required" : "optional"}
                                    </span>
                                  </div>
                                  <p>{param.description}</p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>Sin parámetros de ruta.</p>
                          )}
                        </div>

                        <div className="endpoint-block">
                          <span className="block-label">Body fields</span>
                          {endpoint.bodyFields && endpoint.bodyFields.length > 0 ? (
                            <ul className="field-list">
                              {endpoint.bodyFields.map((field) => (
                                <li key={field.name} className="field-item">
                                  <div className="field-topline">
                                    <code>{field.name}</code>
                                    <span className="field-type">{field.type}</span>
                                    <span className={`required-chip ${field.required ? "required-yes" : "required-no"}`}>
                                      {field.required ? "required" : "optional"}
                                    </span>
                                  </div>
                                  <p>{field.description}</p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>Este endpoint no recibe body.</p>
                          )}
                        </div>

                        {endpoint.exampleBody ? (
                          <div className="endpoint-block">
                            <span className="block-label">Example JSON</span>
                            <pre className="code-block">
                              <code>{endpoint.exampleBody}</code>
                            </pre>
                          </div>
                        ) : null}

                        <div className="endpoint-block">
                          <span className="block-label">Responses</span>
                          <div className="response-list">
                            {endpoint.responses.map((response) => (
                              <span key={response} className="response-chip">
                                {response}
                              </span>
                            ))}
                          </div>
                        </div>

                        {endpoint.notes ? (
                          <div className="endpoint-block">
                            <span className="block-label">Notes</span>
                            <p>{endpoint.notes}</p>
                          </div>
                        ) : null}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
