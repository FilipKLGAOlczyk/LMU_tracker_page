import discordIcon from './icons/icons8-discord-32.png';
import youtubeIcon from './icons/icons8-youtube-32.png';
const Footer = () => {
  return (
    <footer>
        <a href="https://discord.gg/XJRYwZSPs6" target="_blank" rel="noopener noreferrer"><img src={discordIcon} alt="Discord Icon" /></a>
        <a href="https://www.youtube.com/@Yoji720" target="_blank" rel="noopener noreferrer"><img src={youtubeIcon} alt="YouTube Icon" /></a>
      <p>© 2026 LMU Stats Page</p>
    </footer>
  );
}

export default Footer;
