# Virtual Courtroom Simulation - Setup Guide

## Quick Start

Your application is ready to run with mock audio. For the full experience with realistic AI voices, follow the steps below to configure your API keys.

## Required API Keys

### 1. ElevenLabs API Key (Voice Synthesis)

ElevenLabs provides realistic text-to-speech voices for each courtroom participant.

**Steps:**
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up for a free account
3. Navigate to your profile settings
4. Copy your API key
5. Paste it in `.env` as `VITE_ELEVENLABS_API_KEY=your_key_here`

**Free Tier:** 10,000 characters per month

**Voice IDs in Use:**
- Judge: `pNInz6obpgDQGcFmaJgB` (Adam - authoritative)
- Defense Attorney: `21m00Tcm4TlvDq8ikWAM` (Rachel - professional)
- Jury: `AZnzlk1XvdvUeBnXmlld` (Domi - neutral)

You can change these voice IDs in the Supabase database to use different voices from your ElevenLabs account.

### 2. OpenAI API Key (AI Dialogue Generation)

OpenAI powers the AI mode where participants generate dynamic dialogue.

**Steps:**
1. Go to [platform.openai.com](https://platform.openai.com/signup)
2. Create an account and add payment method
3. Navigate to API Keys section
4. Create a new API key
5. Paste it in `.env` as `VITE_OPENAI_API_KEY=your_key_here`

**Note:** OpenAI requires a paid account. The app uses GPT-4 for high-quality dialogue.

**Cost Estimate:**
- GPT-4: ~$0.03 per 1000 tokens
- Average simulation: ~2000 tokens (~$0.06)

## Running Without API Keys

The application works without API keys using fallback features:

- **Without ElevenLabs**: Generates simple tone audio (beeps) as placeholder
- **Without OpenAI**: Uses pre-written mock dialogue for AI mode

This is perfect for testing the UI and understanding the flow before committing to API costs.

## Environment Variables

Your `.env` file should look like this:

```env
VITE_SUPABASE_URL=https://fxnpgcnifkudueheqhqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ELEVENLABS_API_KEY=sk_your_elevenlabs_key_here
VITE_OPENAI_API_KEY=sk-your_openai_key_here
```

## Testing Your Setup

### Test Scripted Mode (ElevenLabs Only)
1. Add your ElevenLabs API key to `.env`
2. Refresh the application
3. Select "Opening Statements" scenario
4. Ensure "Scripted" mode is selected
5. Click "Start"
6. You should hear realistic voices

### Test AI Mode (Requires Both APIs)
1. Add both ElevenLabs and OpenAI keys to `.env`
2. Refresh the application
3. Select any scenario
4. Switch to "AI" mode
5. Click "Start"
6. Participants will generate and speak dynamic dialogue

## Troubleshooting

### Audio Not Playing
- Check browser console for errors
- Ensure browser allows audio playback (click anywhere on page first)
- Verify API keys are correct and have available credits

### API Rate Limits
- **ElevenLabs**: Free tier has 10,000 chars/month
- **OpenAI**: Depends on your billing plan
- Consider pausing between simulations to avoid hitting limits

### CORS Errors
- ElevenLabs and OpenAI APIs allow browser requests
- If you see CORS errors, check your API keys are valid

## Customizing Voices

To use different voices:

1. List available voices in your ElevenLabs account
2. Copy the voice ID you want to use
3. Update the database:

```sql
UPDATE participants
SET voice_id = 'your_new_voice_id'
WHERE role = 'judge';
```

## Security Notes

- Never commit your `.env` file to version control
- API keys are exposed in browser (use backend proxy for production)
- Use environment variables for sensitive data
- Rotate keys regularly

## Cost Management Tips

1. **Use Scripted Mode** for demos (less API calls)
2. **Pause simulations** instead of restarting
3. **Monitor usage** in ElevenLabs and OpenAI dashboards
4. **Test with mock audio** first
5. **Consider caching** audio files for repeated phrases

## Getting Help

- ElevenLabs Docs: [docs.elevenlabs.io](https://docs.elevenlabs.io)
- OpenAI Docs: [platform.openai.com/docs](https://platform.openai.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)

## Next Steps

Once everything is configured:

1. Explore all three scenarios
2. Try both Scripted and AI modes
3. Add custom scenarios in Supabase
4. Experiment with different voice combinations
5. Build your own courtroom cases
