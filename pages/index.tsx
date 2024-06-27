import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import DropDown, { VibeType } from '../components/DropDown';
import LoadingDots from '../components/LoadingDots';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';
import Toggle from '../components/Toggle';

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState('');
  const [vibe, setVibe] = useState<VibeType>('Professional');
  const [bioType, setBioType] = useState<'Twitter' | 'Instagram' | 'LinkedIn'>('Twitter');
  const [generatedBios, setGeneratedBios] = useState<String>('');
  const [isGPT, setIsGPT] = useState(false);

  const bioRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const prompt = `Generate 5 ${
    vibe === 'Casual' ? 'relaxed' : vibe === 'Funny' ? 'silly' : vibe === 'Student' ? 'student-oriented' : vibe === 'Content Creator' ? 'creative' : vibe === 'Artist' ? 'artistic' : 'Professional'
  } ${bioType.toLowerCase()}Generate biography from given input with no hashtags and clearly labeled "1.", "2.", "3.", "4.", and "5.". Only return these 5 ${bioType.toLowerCase()} bios, nothing else. ${
    vibe === 'Funny' ? 'Make the biographies humorous' : ''
  } Make sure each generated biography is less than 300 characters, has short sentences that are found in ${bioType.toLowerCase()} bios, and feel free to use this context as well: ${bio}${
    bio.slice(-1) === '.' ? '' : '.'
  }`;

  console.log({ prompt });
  console.log({ generatedBios });

  const generateBio = async (e: any) => {
    e.preventDefault();
    setGeneratedBios('');
    setLoading(true);
    const response = await fetch(isGPT ? '/api/openai' : '/api/mistral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const onParseGPT = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === 'event') {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? '';
          setGeneratedBios((prev) => prev + text);
        } catch (e) {
          console.error(e);
        }
      }
    };

    const onParseMistral = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === 'event') {
        const data = event.data;
        try {
          const text = JSON.parse(data).choices[0].text ?? '';
          setGeneratedBios((prev) => prev + text);
        } catch (e) {
          console.error(e);
        }
      }
    };

    const onParse = isGPT ? onParseGPT : onParseMistral;

    // https://web.dev/streams/#the-getreader-and-read-methods
    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }
    scrollToBios();
    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Bio Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Generate your next bio using AI
        </h1>
        <div className="mt-7">
          <Toggle isGPT={isGPT} setIsGPT={setIsGPT} />
        </div>

        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/number-1 (1).png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Drop in your job{' '}
              <span className="text-slate-500">(or your favorite hobby)</span>.
            </p>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={'Example: I am a Full-Stack Web Developer (for hobbies: I love Cooking)'}
          />
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/number-2 (2).png" width={30} height={30} alt="2 icon" />
            <p className="text-left font-medium">Select your tone.</p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div>
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/number-3.png" width={30} height={30} alt="3 icon" />
            <p className="text-left font-medium">Select bio type.</p>
          </div>
          <div className="block">
            <select
              value={bioType}
              onChange={(e) => setBioType(e.target.value as 'Twitter' | 'Instagram' | 'LinkedIn')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            >
              <option value="Twitter">Twitter</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
          </div>

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Generate your bio &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedBios && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={bioRef}
                >
                  Your generated bios
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {generatedBios
                  .substring(generatedBios.indexOf('1') + 3)
                  .split(/2\.|3\.|4\.|5\./)
                  .map((generatedBio) => {
                    return (
                      <div
                        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedBio);
                          toast('Bio copied to clipboard', {
                            icon: '✂️',
                          });
                        }}
                        key={generatedBio}
                      >
                        <p>{generatedBio}</p>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </main>

    </div>
  );
};

export default Home;
