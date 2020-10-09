package fr.gouv.vitamui.archive.common.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class LogbookOperationDto extends LogbookEventDto {

    private List<LogbookEventDto> events;

    private String obIdIn;
}
