import { useEffect, useMemo, useState } from 'react';

function entityId(entity) {
  return entity?.id ?? entity?._id;
}

function albumMedia(album) {
  if (Array.isArray(album?.media)) return album.media;
  if (Array.isArray(album?.items)) return album.items;
  return [];
}

function isVideo(media) {
  return media?.type === 'video'
    || media?.mediaType === 'video'
    || String(media?.mimeType ?? '').startsWith('video/');
}

function formatUploadDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function MediaPreview({ albumId, media, getMediaUrl, compact = false, onVideoPlay }) {
  const mediaId = entityId(media);
  const source = getMediaUrl(albumId, mediaId);
  const label = media.originalName || media.fileName || 'Our memory';

  if (isVideo(media)) {
    return <video
      src={source}
      className={compact ? 'album-cover-media' : 'album-lightbox-media'}
      controls={!compact}
      muted={compact}
      playsInline
      preload="metadata"
      aria-label={label}
      onPlay={onVideoPlay}
    />;
  }

  return <img
    src={source}
    className={compact ? 'album-cover-media' : 'album-lightbox-media'}
    alt={label}
    loading="lazy"
  />;
}

export default function AlbumGallery({ albums, getMediaUrl, onVideoPlay }) {
  const [activeAlbumId, setActiveAlbumId] = useState(null);
  const activeAlbum = useMemo(
    () => albums.find(album => String(entityId(album)) === String(activeAlbumId)),
    [activeAlbumId, albums],
  );

  useEffect(() => {
    if (!activeAlbumId) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = event => {
      if (event.key === 'Escape') setActiveAlbumId(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [activeAlbumId]);

  return <>
    <section className="albums-panel glass-panel" aria-labelledby="albums-title">
      <div className="section-heading-row album-heading-row">
        <div>
          <span className="eyebrow">Our chapters in frames</span>
          <h2 className="section-title" id="albums-title">Little albums, big memories</h2>
        </div>
        <p className="section-note">Photos, videos and the exact day they joined our story.</p>
      </div>

      {albums.length ? <div className="album-grid">
        {albums.map(album => {
          const albumId = entityId(album);
          const media = albumMedia(album);
          const cover = media[0];
          const videoCount = media.filter(isVideo).length;
          return <button
            type="button"
            className="album-card"
            key={albumId}
            onClick={() => setActiveAlbumId(albumId)}
            aria-label={`Open album ${album.name}`}
          >
            <span className="album-cover">
              {cover
                ? <MediaPreview albumId={albumId} media={cover} getMediaUrl={getMediaUrl} compact onVideoPlay={onVideoPlay} />
                : <span className="album-empty-cover" aria-hidden="true">♡</span>}
              {cover && isVideo(cover) && <span className="album-video-badge">▶ Video</span>}
            </span>
            <span className="album-card-copy">
              <strong>{album.name}</strong>
              <small>{media.length} {media.length === 1 ? 'memory' : 'memories'}{videoCount ? ` · ${videoCount} video` : ''}</small>
            </span>
            <span className="album-card-arrow" aria-hidden="true">↗</span>
          </button>;
        })}
      </div> : <div className="albums-empty-state">
        <span aria-hidden="true">♡</span>
        <strong>Your first album will live here.</strong>
        <p>Admin Zone se ek naam do, phir photos aur videos add karo.</p>
      </div>}
    </section>

    {activeAlbum && <div className="album-modal-backdrop" role="presentation" onClick={() => setActiveAlbumId(null)}>
      <section
        className="album-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="active-album-title"
        onClick={event => event.stopPropagation()}
      >
        <header className="album-modal-header">
          <div>
            <span className="eyebrow">A chapter of us</span>
            <h2 id="active-album-title">{activeAlbum.name}</h2>
            <p>{albumMedia(activeAlbum).length} saved memories</p>
          </div>
          <button type="button" className="album-modal-close" onClick={() => setActiveAlbumId(null)} aria-label="Close album">×</button>
        </header>

        {albumMedia(activeAlbum).length ? <div className="album-media-grid">
          {albumMedia(activeAlbum).map((media, index) => {
            const albumId = entityId(activeAlbum);
            const mediaId = entityId(media);
            return <figure className="album-media-card" key={mediaId ?? `${media.originalName}-${index}`}>
              <MediaPreview albumId={albumId} media={media} getMediaUrl={getMediaUrl} onVideoPlay={onVideoPlay} />
              <figcaption>
                <span>{isVideo(media) ? 'Video memory' : 'Photo memory'}</span>
                <time dateTime={media.uploadedAt}>{formatUploadDate(media.uploadedAt)}</time>
              </figcaption>
            </figure>;
          })}
        </div> : <div className="albums-empty-state album-modal-empty">
          <span aria-hidden="true">♡</span>
          <strong>This album is waiting for its first memory.</strong>
        </div>}
      </section>
    </div>}
  </>;
}
