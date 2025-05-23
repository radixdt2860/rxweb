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
    [Table("ApplicationObjects",Schema="dbo")]
    public partial class ApplicationObject
    {
		#region ApplicationObjectId Annotations

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [System.ComponentModel.DataAnnotations.Key]
		#endregion ApplicationObjectId Annotations

        public int ApplicationObjectId { get; set; }

		#region ApplicationObjectTypeId Annotations

        [Range(1, int.MaxValue)]
        [Required]
        [RelationshipTableAttribue("ApplicationObjectTypes","dbo","","ApplicationObjectTypeId")]
		#endregion ApplicationObjectTypeId Annotations

        public int ApplicationObjectTypeId { get; set; }

		#region ApplicationObjectName Annotations

        [Required]
        [MaxLength(100)]
		#endregion ApplicationObjectName Annotations

        public string ApplicationObjectName { get; set; }

		#region StatusId Annotations

        [Range(1, int.MaxValue)]
        [Required]
		#endregion StatusId Annotations

        public int StatusId { get; set; }

		#region ApplicationObjectType Annotations

        [HasOne(foreignKeys: new string[] { nameof(ApplicationObjectTypeId),}, nameof(CleanArchitecture.Models.Main.ApplicationObjectType.ApplicationObjects))]
		#endregion ApplicationObjectType Annotations

        public virtual ApplicationObjectType ApplicationObjectType { get; set; }


        public ApplicationObject()
        {
        }
	}
}