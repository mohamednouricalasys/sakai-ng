export enum StatutModeration {
    /// <summary>
    /// En attente de modération.
    /// </summary>
    EnAttente = 1,

    /// <summary>
    /// Approuvée par la modération.
    /// </summary>
    Approuvee = 2,

    /// <summary>
    /// Rejetée pour contenu NSFW.
    /// </summary>
    Rejetee = 3,
}
