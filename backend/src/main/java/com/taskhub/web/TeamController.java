package com.taskhub.web;

import com.taskhub.model.Team;
import com.taskhub.service.TeamService;
import com.taskhub.web.Dtos.MemberReq;
import com.taskhub.web.Dtos.TeamReq;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teams;

    @GetMapping("/mine")
    public List<Team> mine(@AuthenticationPrincipal Long uid) { return teams.mine(uid); }

    @PostMapping
    public Team create(@AuthenticationPrincipal Long uid, @Valid @RequestBody TeamReq r) { return teams.create(uid, r); }

    @PostMapping("/{id}/members")
    public Team addMember(@AuthenticationPrincipal Long uid, @PathVariable String id, @Valid @RequestBody MemberReq r) {
        return teams.addMember(uid, id, r);
    }
}
