package com.goeFast.GeoFastPe.controller;

import com.goeFast.GeoFastPe.dto.request.RatingRequest;
import com.goeFast.GeoFastPe.dto.response.RatingResponse;
import com.goeFast.GeoFastPe.security.UserPrincipal;
import com.goeFast.GeoFastPe.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/resenas")
public class RatingController {
    private final RatingService service;
    public RatingController(RatingService service) { this.service = service; }
    @GetMapping("/usuario/{id}")
    public List<RatingResponse> listar(@PathVariable Long id, @RequestParam(required = false) Long serviceId) { return service.listar(id, serviceId); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RatingResponse crear(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody RatingRequest request) { return service.crear(principal.id(), request); }
}
