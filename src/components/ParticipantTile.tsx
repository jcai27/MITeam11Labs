import { Participant } from '../types';

interface ParticipantTileProps {
  participant: Participant;
  isActive: boolean;
  currentText?: string;
  userStream?: MediaStream | null; // Add userStream prop
}

export function ParticipantTile({ participant, isActive, currentText, userStream }: ParticipantTileProps) {
  const avatarUrl = participant.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.role}`;

  // Use a ref to attach the media stream to the video element
  const videoRef = (videoElement: HTMLVideoElement | null) => {
    if (videoElement && userStream) {
      videoElement.srcObject = userStream;
    }
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-gray-900 transition-all duration-300 ${
        isActive ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50' : 'ring-2 ring-gray-700'
      }`}
    >
      <div className="aspect-video relative">
        {userStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Mute local video to avoid echo
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={avatarUrl}
            alt={participant.name}
            className="w-full h-full object-cover"
          />
        )}

        {isActive && (
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">
                {participant.name}
              </h3>
              <p className="text-gray-300 text-xs capitalize">{participant.role}</p>
            </div>
            {isActive && (
              <div className="flex space-x-1">
                <span className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {currentText && isActive && (
        <div className="absolute bottom-16 left-2 right-2 bg-black/75 backdrop-blur-sm p-2 rounded">
          <p className="text-white text-xs leading-relaxed">{currentText}</p>
        </div>
      )}
    </div>
  );
}
