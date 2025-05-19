{
  description = "Node.js";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
      pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = nixpkgs.legacyPackages.${system}.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
        ];
          shellHook = ''
            export PS1="\[\e[1;32m\](flake-env)\[\e[0m\] \[\e[1;34m\]\u@\h:\w\[\e[0m\]$ "
          '';
        };
      });
}
