using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using RxWeb.Core.Annotations;
using RxWeb.Core.Data.Annotations;
using RxWeb.Core.Sanitizers;
using CleanArchitecture.Models.Enums.Main;
using CleanArchitecture.BoundedContext.SqlContext;
namespace CleanArchitecture.Models.Main
{
    [Table("ComponentLanguageContents",Schema="dbo")]
    public partial class ComponentLanguageContent
    {
		#region ComponentLanguageContentId Annotations

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [System.ComponentModel.DataAnnotations.Key]
		#endregion ComponentLanguageContentId Annotations

        public int ComponentLanguageContentId { get; set; }

		#region ComponentKeyId Annotations

        [Range(1, int.MaxValue)]
        [Required]
        [RelationshipTableAttribue("LanguageContentKeys","dbo","","ComponentKeyId")]
		#endregion ComponentKeyId Annotations

        public int ComponentKeyId { get; set; }

		#region LanguageContentId Annotations

        [Range(1, int.MaxValue)]
        [Required]
        [RelationshipTableAttribue("LanguageContents","dbo","","LanguageContentId")]
		#endregion LanguageContentId Annotations

        public int LanguageContentId { get; set; }


        public string En { get; set; }


        public string Fr { get; set; }

		#region ComponentKey Annotations

        [HasOne(foreignKeys: new string[] { nameof(ComponentKeyId),}, nameof(CleanArchitecture.Models.Main.LanguageContentKey.ComponentLanguageContents))]
		#endregion ComponentKey Annotations

        public virtual LanguageContentKey ComponentKey { get; set; }

		#region LanguageContent Annotations

        [HasOne(foreignKeys: new string[] { nameof(LanguageContentId),}, nameof(CleanArchitecture.Models.Main.LanguageContent.ComponentLanguageContents))]
		#endregion LanguageContent Annotations

        public virtual LanguageContent LanguageContent { get; set; }


        public ComponentLanguageContent()
        {
        }
	}
}