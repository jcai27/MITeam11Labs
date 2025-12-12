import { Participant } from '../types';
import { ParticipantTile } from './ParticipantTile';

interface VideoGridProps {
  participants: Participant[];
  activeSpeaker: string | null;
  currentText?: string;
  userStream?: MediaStream | null; // Add userStream prop
}

export function VideoGrid({ participants, activeSpeaker, currentText, userStream }: VideoGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {participants.map((participant) => (
          <ParticipantTile
            key={participant.id}
            participant={participant}
            isActive={activeSpeaker === participant.role}
            currentText={activeSpeaker === participant.role ? currentText : undefined}
            userStream={participant.role === 'user' ? userStream : undefined} // Pass userStream to the user's tile
          />
        ))}
      </div>
    </div>
  );
}
