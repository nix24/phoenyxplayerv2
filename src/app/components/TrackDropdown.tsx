import type { Track } from "../lib/types";
interface TrackDropdownProps {
    track: Track;
    onDelete: () => void;
}
export function TrackDropdown({ track, onDelete }: TrackDropdownProps) {
    const artists = typeof track.artists === 'string'
        ? track.artists
        : Array.isArray(track.artists)
            ? track.artists.join(', ')
            : 'Unknown Artist';

    const tags = typeof track.tags === 'string'
        ? JSON.parse(track.tags).join(', ')
        : Array.isArray(track.tags)
            ? track.tags.join(', ')
            : 'No tags';
    return (
        <details className="dropdown dropdown-bottom dropdown-end"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
        >
            <summary className="btn btn-ghost btn-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <title>Options</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </summary>
            <ul className="dropdown-content menu bg-neutral-900 rounded-box z-[1] w-52 p-2 shadow">
                <li>
                    <button type="button" onClick={() => {
                        const dialog = document.getElementById(`track-${track.id}`);
                        if (dialog) (dialog as HTMLDialogElement).showModal();
                    }}>
                        Details
                    </button>
                </li>
                <li>
                    <button type="button" onClick={() => {
                        const dialog = document.getElementById(`edit-${track.id}`);
                        if (dialog) (dialog as HTMLDialogElement).showModal();
                    }}>Edit Tags</button></li>
                <li><button type="button" onClick={onDelete} className="text-red-400">Delete</button></li>
            </ul>

            {/* Details Modal */}
            <dialog id={`track-${track.id}`} className="modal">
                <div className="modal-box bg-neutral-900">
                    <h3 className="font-bold text-lg mb-4">{track.title}</h3>
                    <div className="space-y-2">
                        <p>Artists: {artists}</p>
                        <p>Tags: {tags}</p>
                        <p>File Size: {track.fileSize ? `${(track.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</p>
                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn" type="button" onClick={() => (document.getElementById(`track-${track.id}`) as HTMLDialogElement).close()}>close</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Edit Tags Modal */}
            <dialog id={`edit-${track.id}`} className="modal">
                <div className="modal-box bg-neutral-900">
                    <h3 className="font-bold text-lg mb-4">Edit Tags</h3>
                    <p className="py-4">Tag editing coming soon...</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn" type="button" onClick={() => (document.getElementById(`edit-${track.id}`) as HTMLDialogElement).close()}>close</button>
                        </form>
                    </div>
                </div>

            </dialog>
        </details>)
}

