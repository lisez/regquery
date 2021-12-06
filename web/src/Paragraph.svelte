<script lang="ts">
  import MarkText from "./MarkText.svelte";

  export let text: string = "";
  export let regsrc: string = "";

  let pieces: [text: string, mark: boolean][] = [];

  $: {
    pieces = markText(text, regsrc);
  }

  export function markText(
    text: string,
    regsrc: string
  ): [text: string, mark: boolean][] {
    if (!!regsrc) {
      try {
        const nextPieces: [text: string, mark: boolean][] = [];
        let reg = new RegExp(regsrc, "g");
        let restText = text;
        let match: RegExpExecArray | null = reg.exec(restText);
        while (match) {
          if (match[0].length == 0) {
            throw new Error(`invalid regsrc ${regsrc}`);
          }

          const start = match.index;
          if (start) {
            const before = restText.substring(0, start);
            nextPieces.push([before, false]);
            restText = restText.substring(start);
          }

          const matched = restText.substring(0, match[0].length);
          nextPieces.push([matched, true]);
          restText = restText.substring(match[0].length);

          reg.lastIndex = 0;
          match = reg.exec(restText);
        }
        if (restText.length) {
          nextPieces.push([restText, false]);
        }

        return nextPieces;
      } catch (error) {
        console.error(error);
        return [[text, false]];
      }
    } else {
      return [[text, false]];
    }
  }
</script>

<p>
  {#each pieces as [keyword, mark]}
    {#if mark}
      <MarkText text={keyword} />
    {:else}
      <span>{keyword}</span>
    {/if}
  {/each}
</p>

<style>
  p {
    white-space: pre-wrap;
    line-height: 1.5;
  }
</style>
