export function renderShellHeader() {
  return String.raw`
<!-- HEADER -->
    <header class="app-header" id="app-header" data-tier="free">
      <div class="app-header__top">
        <div class="app-logo">
          <div class="app-logo__icon" aria-hidden="true">
            <img class="app-logo__mark" src="/brand/favicon.svg" alt="" loading="eager" decoding="async" />
          </div>
          <span class="app-logo__name">CoolTrack</span>
          <span class="app-logo__pill" id="app-logo-pill" data-tier="free" hidden>
            <svg class="app-logo__pill-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z"/>
            </svg>
            <span class="app-logo__pill-text" id="app-logo-pill-text">PRO</span>
          </span>
        </div>

        <div class="app-header__actions">
          <!-- Sync status (só aparece quando há sincronização pendente/em curso) -->
          <div class="header-sync" id="sync-status" hidden>
            <svg class="header-sync__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 12a9 9 0 0 1-15.53 6.36M3 12a9 9 0 0 1 15.53-6.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M17 5h4V1M7 19H3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="header-sync__text" id="sync-status-txt">pendente</span>
          </div>

          <!-- Alertas (sino com pill de contagem) -->
          <button
            class="header-icon-btn header-alert-btn"
            data-action="go-alertas"
            aria-label="Abrir alertas"
            title="Abrir alertas"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <span class="header-alert-pill" id="header-alert-pill" hidden>0</span>
            <span class="header-alert-tooltip" id="header-alert-tooltip" role="tooltip" hidden></span>
          </button>

          <!-- Gear de configurações (acopla ajuda + tema) -->
          <div class="header-settings">
            <button
              class="header-icon-btn"
              id="header-help-btn"
              data-action="toggle-help-menu"
              aria-label="Configurações e ajuda"
              title="Configurações e ajuda"
              aria-expanded="false"
              aria-controls="header-help-menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="header-help-menu" id="header-help-menu" data-plan="free" hidden>
              <div class="header-help-menu__top-cta">
                <button type="button" class="header-help-menu__cta header-help-menu__cta--primary" data-nav="registro">
                  ➕ Registrar serviço
                </button>
                <button type="button" class="header-help-menu__cta header-help-menu__cta--secondary" data-action="go-orcamentos">
                  📋 Novo orçamento
                </button>
              </div>

              <section class="header-help-menu__section" aria-label="Actions">
                <p class="header-help-menu__section-title">ACTIONS</p>
                <button type="button" class="header-help-menu__item" data-action="go-alertas">
                  🔔 Alertas
                  <span class="header-help-menu__badge" id="header-help-menu-alert-badge" hidden>0</span>
                </button>
                <button type="button" class="header-help-menu__item" data-action="go-orcamentos">
                  🧾 Orçamentos
                </button>
              </section>

              <section class="header-help-menu__section" aria-label="Operation">
                <p class="header-help-menu__section-title">OPERATION</p>
                <button type="button" class="header-help-menu__item" data-action="open-pmoc-modal">
                  📜 Gerar PMOC
                </button>
                <button type="button" class="header-help-menu__item" data-action="open-pmoc-info">
                  ℹ️ Sobre PMOC
                </button>
              </section>

              <section class="header-help-menu__section" aria-label="Organization">
                <p class="header-help-menu__section-title">ORGANIZATION</p>
                <button type="button" class="header-help-menu__item" id="header-help-go-clientes" data-nav="clientes" hidden>
                  👥 Clientes
                </button>
                <button type="button" class="header-help-menu__item" id="header-help-clientes-upsell" data-action="open-upgrade">
                  🚀 Organizar por cliente (Pro)
                </button>
              </section>

              <section class="header-help-menu__section" aria-label="Account">
                <p class="header-help-menu__section-title">ACCOUNT</p>
                <button type="button" class="header-help-menu__item" data-action="open-profile">
                  👤 Meu perfil
                </button>
                <button type="button" class="header-help-menu__item" data-action="toggle-theme">
                  <span id="header-theme-label">Alternar tema</span>
                </button>
              </section>

              <section class="header-help-menu__section" aria-label="Help">
                <p class="header-help-menu__section-title">HELP</p>
                <button type="button" class="header-help-menu__item" data-action="help-open-tutorial">
                  ▶️ Ver tutorial
                </button>
                <button type="button" class="header-help-menu__item" data-action="help-score-info">
                  🧠 Como funciona o score
                </button>
                <button type="button" class="header-help-menu__item" data-action="help-support">
                  💬 Suporte
                </button>
                <button type="button" class="header-help-menu__item" data-action="help-feedback">
                  ⭐ Enviar feedback
                </button>
              </section>

              <section class="header-help-menu__section" aria-label="Upgrade">
                <p class="header-help-menu__section-title">UPGRADE</p>
                <button type="button" class="header-help-menu__status-card header-help-menu__status-card--upsell" data-action="open-upgrade">
                  Desbloqueie o modo Empresa
                </button>
                <div class="header-help-menu__status-card header-help-menu__status-card--active" hidden>
                  Plano PRO ativo
                </div>
              </section>
            </div>
          </div>

          <!-- Avatar do usuário (abre profile/account modal) -->
          <button
            class="header-avatar"
            id="header-avatar"
            data-action="open-profile"
            data-tier="free"
            aria-label="Meu perfil — abre sua conta"
            title="Meu perfil"
          >
            <span class="header-avatar__initials" id="header-avatar-initials">—</span>
          </button>
        </div>
      </div>

      <!-- Stats bar preservada no DOM mas oculta por CSS (pode voltar via toggle no futuro) -->
      <div class="header-stats-bar">
        <div class="header-stats-bar__inner" id="stats-bar-inner">
          <div class="stat-pill">
            <div class="stat-pill__value" id="hst-total">—</div>
            <div class="stat-pill__label">EQUIPAMENTOS ATIVOS</div>
          </div>
          <div class="stat-pill">
            <div class="stat-pill__value" id="hst-mes">—</div>
            <div class="stat-pill__label">SERVIÇOS ESTE MÊS</div>
          </div>
          <div class="stat-pill">
            <div class="stat-pill__value stat-pill__value--danger" id="hst-alert">—</div>
            <div class="stat-pill__label">ALERTAS CRÍTICOS</div>
          </div>
        </div>
      </div>
      </div>

      <!-- Status legado preservado para outros fluxos (alerts sistema/falhas) — oculto por padrão e
           populado pelo dashboard quando necessário -->
      <div class="app-header__legacy-status" hidden>
        <div class="status-indicator" id="status-sistema" hidden>
          <span class="status-indicator__dot status-indicator__dot--ok"></span>
          <span>Sistema operacional</span>
        </div>
        <div class="status-indicator" id="status-falhas" hidden>
          <span class="status-indicator__dot status-indicator__dot--danger"></span>
          <span id="status-falhas-txt">0 anomalias críticas</span>
        </div>
        <div class="app-header__date" id="hdr-date"></div>
      </div>

    </header>
`;
}
