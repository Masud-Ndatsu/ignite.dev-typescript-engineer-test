import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { App } from "octokit";

export default class GithubController {
  public async index({
    request,
    response,
  }: HttpContextContract): Promise<void> {
    try {
      const page = Number(request.qs().page) ?? 1;
      const per_page = Number(request.qs().per_page) ?? 100;

      const app = new App({
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_PRIVATE_KEY!,
      });

      const result = await app.octokit.request(
        "GET /users/{username}/installation",
        {
          username: process.env.GITHUB_USERNAME!,
        }
      );

      const INSTALLATION_ID = result.data.id;

      const octokit = await app.getInstallationOctokit(INSTALLATION_ID);

      const repos = await octokit.request("GET /installation/repositories", {
        page,
        per_page,
      });

      const privateRepos = repos.data.repositories.filter(
        (repo) => repo.private === true
      );

      return response.ok({
        status: "OK",
        data: privateRepos,
      });
    } catch (error: any) {
      console.error("Error fetching repos", error);
      return response.status(500).send({
        status: "ERROR",
        error: error.message,
      });
    }
  }
}
