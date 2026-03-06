import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: "identify guilds" } }
    })
  ],
  callbacks: {
    async signIn({ profile }) {
      const guilds = profile.guilds || [];
      const allowedGuild = process.env.DISCORD_GUILD_ID;
      return guilds.some(g => g.id === allowedGuild);
    },
    async jwt({ token, profile }) {
      if (profile) token.user = profile;
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    }
  }
};

export default NextAuth(authOptions);
