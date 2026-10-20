{
  description = "Development environment for the OpenQuest Foundry VTT system";

  inputs = {
    foundry-dev.url = "github:michalzc/foundry-dev";
    nixpkgs.follows = "foundry-dev/nixpkgs";
  };

  outputs =
    { foundry-dev, nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      yarn = pkgs.yarn.override { nodejs = pkgs.nodejs_24; };
      env = foundry-dev.lib.mkFoundryEnvironment {
        inherit system;
        foundry = {
          version = "14.369";
          sha256 = "sha256-TIIhnx9s8mcK02kcryO3kpqkPSr5ELr1gd9bpYyurC4=";
        };
        nodejsMajor = 24;
        port = 32000;
        extraPackages = [
          yarn
          pkgs.gh
        ];
        development = {
          packageType = "system";
          packageId = "oq";
          worldId = "oq-dev";
          worldTitle = "OpenQuest Development";
          buildCommand = [
            "${yarn}/bin/yarn"
            "build"
          ];
          watchCommand = [
            "${yarn}/bin/yarn"
            "dev"
          ];
        };
      };
    in
    {
      devShells.${system} = {
        default = env.devShell;
        foundry = env.devShell;
      };
      apps.${system} = {
        start-foundry = env.app;
        start-dev = env.devApp;
      };
      packages.${system} = {
        foundryvtt = env.package;
        foundryvtt-13 = env.package;
        start-foundry = env.launcher;
        start-dev = env.devLauncher;
      };
      formatter.${system} = env.formatter;
    };
}
