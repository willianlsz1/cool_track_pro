export async function mountView(renderFn, state = {}, { viewId = 'view-test' } = {}) {
  const host = document.createElement('section');
  host.id = viewId;
  host.className = 'view active';
  const content = document.createElement('div');
  content.className = 'view-content';
  host.appendChild(content);
  document.body.appendChild(host);

  const cleanup = () => host.remove();
  const result = await renderFn(state);
  return { container: host, content, cleanup, result };
}
