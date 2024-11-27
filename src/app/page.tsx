import { tracks } from "./lib/testData";

export default function Home() {

  return (
    <main>
      <header>
        <p>
          Disclaimer: This app is still in early stages of development. Feel free
          to check out the code on{" "}
          <a href="https://github.com/nix24/phoenixPlayer">github!</a>
        </p>
        <h1>Songs</h1>
      </header>

      <div>
        <section role="region" aria-live="polite">
          <div>
            <form>
              <label htmlFor="search">Search the library</label>
              <input
                type="search"
                id="search"
                placeholder="Search the library..."
              />
            </form>
          </div>
        </section>

        <hr />
        <section>
          <ul>
            {tracks.map((track) => (
              <li key={track.id}>
                {track.title} by {track.artist}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside>
        <div>
          <div>
            <label htmlFor="directory-upload">Upload from Directory</label>
            <input
              type="file"
              id="directory-upload"
              accept="audio/*"
              multiple
            />
          </div>

          <div>
            <label htmlFor="file-upload">Upload individual Files</label>
            <input
              type="file"
              id="file-upload"
              accept="audio/*"
            />
          </div>
        </div>
      </aside>
    </main>
  );
}
