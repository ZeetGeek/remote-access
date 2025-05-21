export async function POST(req) {
  try {
    const { action } = await req.json();

    // Generate a random 9-digit number
    if (action === 'generateNumber') {
      const requestNumber = generateRandomNumber();
      return Response.json({ success: true, requestNumber });
    }

    return Response.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Session API error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// Generate a random 9-digit number
function generateRandomNumber() {
  const min = 100000000; // 9 digits (min)
  const max = 999999999; // 9 digits (max)
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

export const dynamic = 'force-dynamic';