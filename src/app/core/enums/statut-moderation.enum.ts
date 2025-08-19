export enum StatutModeration {
    /// <summary>
    /// En attente de modération.
    /// </summary>
    EnAttente = 0,

    /// <summary>
    /// Approuvée par la modération.
    /// </summary>
    Approuvee = 1,

    /// <summary>
    /// Rejetée pour contenu NSFW.
    /// </summary>
    Rejetee = 2,
}
