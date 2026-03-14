import { Panel } from './Panel';

interface ScannerFeed {
  id: string;
  name: string;
  feedId: string;
  location: string;
}

const MICHIGAN_SCANNERS: ScannerFeed[] = [
  { id: 'detroit-pd', name: 'Detroit Police', feedId: '13655', location: 'Detroit' },
  { id: 'detroit-fire', name: 'Detroit Fire', feedId: '28575', location: 'Detroit' },
  { id: 'wayne-county', name: 'Wayne County', feedId: '16572', location: 'Wayne Co' },
  { id: 'oakland-county', name: 'Oakland County', feedId: '14439', location: 'Oakland Co' },
  { id: 'grand-rapids', name: 'Grand Rapids PD', feedId: '25498', location: 'Grand Rapids' },
  { id: 'flint-pd', name: 'Flint Police', feedId: '8498', location: 'Flint' },
  { id: 'lansing-pd', name: 'Lansing Police', feedId: '21469', location: 'Lansing' },
  { id: 'ann-arbor', name: 'Ann Arbor PD', feedId: '4654', location: 'Ann Arbor' },
  { id: 'msp', name: 'MI State Police', feedId: '14070', location: 'Statewide' },
  { id: 'kent-county', name: 'Kent County', feedId: '25499', location: 'Kent Co' },
];

interface SoundCloudTrack {
  name: string;
  url: string;
}

const TRANCE_PLAYLISTS: SoundCloudTrack[] = [
  { name: 'Deep Trance', url: 'https://soundcloud.com/trabormusic/deep-trance-2024' },
  { name: 'Progressive', url: 'https://soundcloud.com/above-and-beyond/group-therapy' },
  { name: 'Uplifting', url: 'https://soundcloud.com/astateoftrance/sets/a-state-of-trance' },
  { name: 'Psy Trance', url: 'https://soundcloud.com/infected-mushroom/sets/more-than-just-a-name' },
  { name: 'Ambient', url: 'https://soundcloud.com/cosmicgate/sets/wake-your-mind' },
];

const STORAGE_KEY = 'worldmonitor-live-audio';

interface AudioState {
  selectedScanner: string;
  selectedPlaylist: number;
}

function loadState(): AudioState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { selectedScanner: 'detroit-pd', selectedPlaylist: 0 };
}

function saveState(state: AudioState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export class LiveAudioPanel extends Panel {
  private state: AudioState;
  private scannerAudio: HTMLAudioElement | null = null;
  private scannerPlaying = false;
  private musicPlaying = false;

  constructor() {
    super({ id: 'live-audio', title: 'Police Scanner', className: 'live-audio-panel police-scanner-panel' });
    this.state = loadState();
    this.render();
  }

  private render(): void {
    const scanner = MICHIGAN_SCANNERS.find(s => s.id === this.state.selectedScanner) || MICHIGAN_SCANNERS[0]!;

    this.content.innerHTML = `
      <div class="live-audio-container">
        <div class="audio-section scanner-section">
          <div class="audio-section-header">
            <div class="section-title-row">
              <span class="section-icon">🚔</span>
              <span class="section-title">Police Scanner</span>
              <span class="scanner-badge ${this.scannerPlaying ? 'live' : ''}" id="scannerBadge">${this.scannerPlaying ? 'LIVE' : 'OFF'}</span>
            </div>
            <button class="audio-toggle-btn ${this.scannerPlaying ? 'active' : ''}" id="scannerToggle">
              ${this.scannerPlaying ? '⏸' : '▶'}
            </button>
          </div>
          <div class="scanner-selector">
            <select class="scanner-select" id="scannerSelect">
              ${MICHIGAN_SCANNERS.map(s => `
                <option value="${s.id}" ${s.id === this.state.selectedScanner ? 'selected' : ''}>
                  ${s.name} — ${s.location}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="scanner-status" id="scannerStatus"></div>
          ${this.scannerPlaying
            ? this.getBroadcastifyEmbed(scanner)
            : `<div class="embed-placeholder">
                 <span class="placeholder-icon">📡</span>
                 <span>Press play to listen to ${scanner.name}</span>
               </div>`
          }
          <div class="scanner-visualizer ${this.scannerPlaying ? 'active' : ''}" id="scannerViz">
            ${Array.from({ length: 24 }, () => '<div class="viz-bar"></div>').join('')}
          </div>
        </div>

        <div class="audio-divider"></div>

        <div class="audio-section music-section">
          <div class="audio-section-header">
            <div class="section-title-row">
              <span class="section-icon">🎵</span>
              <span class="section-title">Trance Radio</span>
              <span class="scanner-badge ${this.musicPlaying ? 'live music-live' : ''}" id="musicBadge">${this.musicPlaying ? 'PLAYING' : 'OFF'}</span>
            </div>
            <button class="audio-toggle-btn music-toggle ${this.musicPlaying ? 'active' : ''}" id="musicToggle">
              ${this.musicPlaying ? '⏸' : '▶'}
            </button>
          </div>
          <div class="playlist-selector">
            ${TRANCE_PLAYLISTS.map((p, i) => `
              <button class="playlist-btn ${i === this.state.selectedPlaylist ? 'active' : ''}"
                      data-playlist="${i}">
                ${p.name}
              </button>
            `).join('')}
          </div>
          <div class="soundcloud-embed" id="scEmbed">
            ${this.musicPlaying
              ? this.getSoundCloudEmbed()
              : `<div class="embed-placeholder">
                   <span class="placeholder-icon">🎧</span>
                   <span>Press play or select a playlist to start trance radio</span>
                 </div>`
            }
          </div>
        </div>

        <div class="sponsored-section sponsored-featured">
          <div class="sponsored-header">SPONSORED BY</div>
          <div class="sponsored-slot sponsored-slot-featured" id="sponsorSlot">
            <div class="sponsored-featured-content">
              <div class="sponsored-featured-name">John Heffron</div>
              <div class="sponsored-featured-tagline">Comedian • Actor • Michigan Native</div>
              <div class="sponsored-featured-bio">Winner of NBC's Last Comic Standing. Bringing laughs from Detroit to the world.</div>
              <a class="sponsored-featured-btn" href="https://linktr.ee/comedianjohnheffron" target="_blank" rel="noopener">
                Follow John Heffron
              </a>
            </div>
          </div>
        </div>

        <div class="audio-footer">
          <span class="footer-note">Scanner feeds via Broadcastify • Music via SoundCloud</span>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  private getBroadcastifyEmbed(scanner: ScannerFeed): string {
    return `<iframe
      id="scannerEmbed"
      width="100%" height="150" frameborder="0" scrolling="no" allow="autoplay"
      sandbox="allow-scripts allow-same-origin allow-forms"
      src="https://www.broadcastify.com/listen/feed/${scanner.feedId}/web"
      style="border:none; border-radius: 8px; background: #111;"
    ></iframe>`;
  }

  private getSoundCloudEmbed(): string {
    const track = TRANCE_PLAYLISTS[this.state.selectedPlaylist]!;
    return `<iframe
      id="scPlayer"
      width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      src="https://w.soundcloud.com/player/?url=${encodeURIComponent(track.url)}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true"
    ></iframe>`;
  }

  private attachListeners(): void {
    const scannerToggle = this.content.querySelector('#scannerToggle');
    const musicToggle = this.content.querySelector('#musicToggle');
    const scannerSelect = this.content.querySelector('#scannerSelect') as HTMLSelectElement | null;

    scannerToggle?.addEventListener('click', () => {
      if (this.scannerPlaying) {
        this.stopScanner();
        this.render();
      } else {
        this.startScanner();
      }
    });

    musicToggle?.addEventListener('click', () => {
      this.musicPlaying = !this.musicPlaying;
      this.render();
    });

    scannerSelect?.addEventListener('change', () => {
      this.state.selectedScanner = scannerSelect.value;
      saveState(this.state);
      const wasPlaying = this.scannerPlaying;
      this.stopScanner();
      if (wasPlaying) {
        this.startScanner();
      } else {
        this.render();
      }
    });

    this.content.querySelectorAll<HTMLElement>('[data-playlist]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.selectedPlaylist = parseInt(btn.dataset.playlist || '0', 10);
        saveState(this.state);
        // Always start playback when a playlist is clicked
        this.musicPlaying = true;
        this.render();
      });
    });
  }

  private startScanner(): void {
    this.stopScanner();
    const scanner = MICHIGAN_SCANNERS.find(s => s.id === this.state.selectedScanner);
    if (!scanner) return;

    // Use Broadcastify embed iframe for reliable playback
    this.scannerPlaying = true;
    this.render();

    const statusEl = this.content.querySelector('#scannerStatus');
    if (statusEl) {
      statusEl.textContent = 'Streaming via Broadcastify';
      statusEl.className = 'scanner-status live';
    }
  }

  private stopScanner(): void {
    if (this.scannerAudio) {
      this.scannerAudio.pause();
      this.scannerAudio.src = '';
      this.scannerAudio.load();
      this.scannerAudio = null;
    }
    this.scannerPlaying = false;
  }

  destroy(): void {
    this.stopScanner();
    super.destroy();
  }
}
