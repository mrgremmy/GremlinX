import { GREMLIN_AVATARS, svgToDataURI } from '../../data/gremlinAvatars.ts';
import { Modal } from '../ui/Modal.tsx';

interface PFPSelectorProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly currentId: string;
    readonly onSelect: (id: string) => void;
}

/** Grid modal for choosing a gremlin avatar. */
export function PFPSelector({ open, onClose, currentId, onSelect }: PFPSelectorProps): JSX.Element {
    return (
        <Modal open={open} onClose={onClose} title="Choose Your Avatar">
            <div className="pfp-grid">
                {GREMLIN_AVATARS.map((avatar) => (
                    <button
                        key={avatar.id}
                        className={`pfp-option ${avatar.id === currentId ? 'selected' : ''}`}
                        onClick={(): void => {
                            onSelect(avatar.id);
                            onClose();
                        }}
                        title={avatar.name}
                    >
                        <img src={svgToDataURI(avatar.svg)} alt={avatar.name} />
                        <span className="pfp-option-name">{avatar.name}</span>
                    </button>
                ))}
            </div>
        </Modal>
    );
}
